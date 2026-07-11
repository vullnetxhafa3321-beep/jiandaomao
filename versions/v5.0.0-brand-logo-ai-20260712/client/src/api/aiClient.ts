// ── AI Chat API Client ──
// OpenAI-compatible（对齐 MnAuRb AI问答模块_v2接口）
// 默认走本机代理 /api/ai → 免费 Pollinations；也可换成 Groq / DeepSeek 等

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

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

/** Default: 同源代理，密钥留在服务端 */
let defaultConfig: AIConfig = {
  baseUrl: `${import.meta.env.VITE_API_BASE || ''}/api/ai`,
  apiKey: 'local',
  model: 'openai',
};

/** Call once at app startup to configure the AI backend */
export function initAIClient(config: Partial<AIConfig>): void {
  defaultConfig = { ...defaultConfig, ...config };
}

export function getAIConfig(): AIConfig {
  return { ...defaultConfig };
}

export function isAIConfigured(): boolean {
  return Boolean(defaultConfig.baseUrl);
}

export { SYSTEM_PROMPT };

// ── Non-streaming chat ──

export async function chat(
  history: AIChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const messages: AIChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ];

  const res = await fetch(`${defaultConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${defaultConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: defaultConfig.model,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI API ${res.status}: ${text.slice(0, 120)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI 返回为空，请稍后重试');
  return String(content).trim();
}

// ── Streaming chat (SSE) ──

export async function chatStream(
  history: AIChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const messages: AIChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ];

  const res = await fetch(`${defaultConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${defaultConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: defaultConfig.model,
      messages,
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI API ${res.status}: ${text.slice(0, 120)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('浏览器不支持流式读取');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onToken(delta);
        }
      } catch {
        // skip unparseable chunks
      }
    }
  }

  if (!fullText) throw new Error('AI 返回为空，请稍后重试');
  return fullText.trim();
}
