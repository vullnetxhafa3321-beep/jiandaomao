/**
 * OpenAI-compatible AI chat proxy.
 * Default: Pollinations free anonymous API (no key needed)
 *   https://text.pollinations.ai/openai
 * Optional: set AI_API_KEY + AI_BASE_URL for Groq / DeepSeek / OpenAI etc.
 *
 * Groq free tier example:
 *   AI_BASE_URL=https://api.groq.com/openai/v1
 *   AI_API_KEY=gsk_...
 *   AI_MODEL=llama-3.3-70b-versatile
 */

const SYSTEM_PROMPT = `你是「捡到猫了」App 的 AI 救助助手，专门帮助用户处理流浪动物救助相关问题。

你的知识领域：
- 流浪猫/狗的发现与初步处理流程
- 宠物医院选择与就医指引
- 动物领养条件与流程
- 安全抓捕流浪动物技巧
- 常见宠物品种识别建议

回答规则：
- 用温暖、友好的语气，适当使用 emoji
- 回答简洁有条理，分点列出时使用数字序号
- 涉及安全问题时务必强调注意事项
- 不确定的问题诚实告知，建议用户咨询专业兽医
- 始终鼓励用户善待动物、负责任救助
- 用简体中文回答`;

function aiConfig() {
  const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY || '';
  const baseUrl = (
    process.env.AI_BASE_URL ||
    (apiKey ? 'https://api.groq.com/openai/v1' : 'https://text.pollinations.ai/openai')
  ).replace(/\/$/, '');
  const model =
    process.env.AI_MODEL ||
    (apiKey && baseUrl.includes('groq') ? 'llama-3.3-70b-versatile' : 'openai');
  return { apiKey, baseUrl, model, provider: apiKey ? (baseUrl.includes('groq') ? 'groq' : 'custom') : 'pollinations' };
}

export function registerAiRoutes(app) {
  app.get('/api/ai/status', (_req, res) => {
    const cfg = aiConfig();
    res.json({
      ok: true,
      provider: cfg.provider,
      model: cfg.model,
      configured: true,
    });
  });

  /** OpenAI-compatible: POST /api/ai/chat/completions */
  app.post('/api/ai/chat/completions', async (req, res) => {
    const cfg = aiConfig();
    const body = req.body || {};
    const wantStream = Boolean(body.stream);

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const hasSystem = incoming.some((m) => m?.role === 'system');
    const messages = hasSystem
      ? incoming
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...incoming];

    const payload = {
      model: body.model || cfg.model,
      messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 800,
      stream: wantStream,
    };

    const headers = { 'Content-Type': 'application/json' };
    if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;

    try {
      const upstream = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(wantStream ? 90_000 : 45_000),
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => '');
        console.warn('[ai]', cfg.provider, upstream.status, text.slice(0, 200));
        return res.status(upstream.status).json({
          error: {
            message: `上游 AI 服务失败 (${upstream.status})`,
            detail: text.slice(0, 200),
          },
        });
      }

      if (wantStream && upstream.body) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const reader = upstream.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
        } catch (err) {
          console.warn('[ai] stream interrupted:', err.message);
        }
        return res.end();
      }

      const data = await upstream.json();
      return res.json(data);
    } catch (err) {
      console.warn('[ai] proxy error:', err.message);
      return res.status(502).json({
        error: { message: 'AI 服务暂时不可用，请稍后重试', detail: err.message },
      });
    }
  });
}

export { SYSTEM_PROMPT, aiConfig };
