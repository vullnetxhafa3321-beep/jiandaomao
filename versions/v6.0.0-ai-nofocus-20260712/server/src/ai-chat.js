/**
 * AI 问答 v3：领域守卫 → 知识库检索 → Pollinations 免费接口
 * https://text.pollinations.ai/openai
 *
 * 参考：MnAuRb AI问答模块_v3知识库（domain-guard + knowledge-base）
 */

import { checkMessages } from './ai/domain-guard.js';
import { searchKnowledge } from './ai/knowledge-base.js';

const SYSTEM_PROMPT_BASE = `你是「捡到猫了」App 的 AI 救助助手，专门帮助用户处理流浪动物救助和宠物养护相关问题。

你的知识领域（必须严格遵守）：
- 流浪猫/狗的发现与初步处理流程
- 宠物医院选择与就医指引
- 动物领养条件与流程
- 安全抓捕流浪动物技巧
- 猫咪/狗狗常见疾病症状与应急处理
- 疫苗、驱虫、绝育等预防保健知识
- 猫咪品种识别与行为解读
- 猫咪日常喂养与护理

回答规则：
- 用温暖、友好的语气，适当使用 emoji
- 回答简洁有条理，分点列出时使用数字序号
- 涉及安全问题时务必强调注意事项
- 不确定的问题诚实告知，建议用户咨询专业兽医
- 始终鼓励用户善待动物、负责任救助
- 用简体中文回答
- 如果用户问了与宠物救助无关的问题，礼貌引导他们回到宠物救助话题
- 优先参考下方「参考知识库」，但不要逐字照抄`;

const UA = 'Mozilla/5.0 (compatible; JiandaomaoAI/5.1; +https://jiandaomao.vercel.app)';
const POLLINATIONS_BASE = 'https://text.pollinations.ai/openai';
const POLLINATIONS_MODEL = 'openai';

function aiConfig() {
  return {
    provider: 'pollinations',
    protocol: 'openai',
    baseUrl: POLLINATIONS_BASE,
    model: POLLINATIONS_MODEL,
    configured: true,
  };
}

function buildSystemPrompt(lastUserText) {
  const matched = searchKnowledge(lastUserText || '', 3);
  let system = SYSTEM_PROMPT_BASE;
  if (matched.length > 0) {
    const knowledgeText = matched
      .map((k) => `【${k.category}】\n${k.content}`)
      .join('\n\n---\n\n');
    system += `\n\n## 参考知识库（优先基于以下专业知识回答，但不要逐字照抄）:\n\n${knowledgeText}`;
  }
  return { system, matched };
}

function openaiShape(content, model, extra = {}) {
  return {
    id: `chatcmpl-local-${Date.now()}`,
    object: 'chat.completion',
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      },
    ],
    ...extra,
  };
}

async function callPollinations({ system, messages, maxTokens }) {
  const payload = {
    model: POLLINATIONS_MODEL,
    messages: [{ role: 'system', content: system }, ...messages.filter((m) => m.role !== 'system')],
    temperature: 0.7,
    max_tokens: maxTokens || 800,
  };

  const res = await fetch(`${POLLINATIONS_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45_000),
  });

  const textBody = await res.text();
  if (!res.ok) {
    const err = new Error(`Pollinations ${res.status}: ${textBody.slice(0, 160)}`);
    err.status = res.status;
    throw err;
  }
  const data = JSON.parse(textBody);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Pollinations 返回为空');
  return { content: String(content).trim(), model: data.model || POLLINATIONS_MODEL };
}

export function registerAiRoutes(app) {
  app.get('/api/ai/status', (_req, res) => {
    const cfg = aiConfig();
    res.json({
      ok: true,
      provider: cfg.provider,
      protocol: cfg.protocol,
      model: cfg.model,
      configured: true,
      features: ['domain-guard', 'knowledge-base'],
    });
  });

  /** OpenAI-compatible: POST /api/ai/chat/completions */
  app.post('/api/ai/chat/completions', async (req, res) => {
    const body = req.body || {};
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    if (!incoming.length) {
      return res.status(400).json({ error: { message: 'Missing messages' } });
    }

    const dialog = incoming.filter((m) => m.role === 'user' || m.role === 'assistant');

    // ① 领域守卫
    const guard = checkMessages(dialog);
    if (!guard.allowed) {
      return res.json(
        openaiShape(guard.reply, 'domain-guard', {
          source: 'guard',
          jiandaomao: { guard: true },
        })
      );
    }

    // ② 知识库检索 + ③ Pollinations
    const lastUser = [...dialog].reverse().find((m) => m.role === 'user');
    const { system, matched } = buildSystemPrompt(lastUser?.content || '');

    try {
      const result = await callPollinations({
        system,
        messages: dialog,
        maxTokens: body.max_tokens ?? 800,
      });
      return res.json(
        openaiShape(result.content, result.model, {
          source: 'pollinations',
          jiandaomao: {
            provider: 'pollinations',
            knowledge_ids: matched.map((k) => k.id),
          },
        })
      );
    } catch (err) {
      console.warn('[ai] pollinations failed:', err.message);
      return res.status(502).json({
        error: { message: 'AI 服务暂时不可用，请稍后重试', detail: err.message },
      });
    }
  });
}

export { SYSTEM_PROMPT_BASE as SYSTEM_PROMPT, aiConfig };
