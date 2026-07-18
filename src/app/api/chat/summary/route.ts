import { NextRequest, NextResponse } from 'next/server';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { RateLimiter } from '@/lib/rate-limit';
import { createAgentLLM, hasGoogleApiKey } from '@/ai/llm';
import { assertSameOrigin, clientIp } from '@/lib/request-guard';
import { z } from 'zod';
import { routeLogger } from '@/lib/logger';

const limiter = new RateLimiter(60_000, 5);
const log = routeLogger('/api/chat/summary');

const HistorySchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(5000),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(req: NextRequest) {
  try {
    const originBlock = assertSameOrigin(req);
    if (originBlock) return originBlock;

    const ip = clientIp(req);
    const allowed = await limiter.check(`chat_summary_${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!hasGoogleApiKey()) {
      return NextResponse.json(
        { error: 'AI summary is not configured (missing GOOGLE_API_KEY)' },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = HistorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Missing or invalid history' }, { status: 400 });
    }
    const { history } = parsed.data;

    const llm = createAgentLLM({
      model: 'gemini-2.5-flash',
      temperature: 0.1,
    });

    const systemPrompt = `
You are a clinical synthesis AI assistant for a NICU app.
Your task is to review the following chat history between a parent and an AI support system, and generate a clear, objective clinical summary designed to be handed to a doctor or NICU nurse.

Please format your summary using standard Markdown. Include the following sections if relevant information is present:
- **Patient Context:** (Any mentioned age, conditions, etc.)
- **Primary Concerns:** (What the parent is worried about)
- **Key Symptoms / Observations:** (e.g., temperature, lethargy, feeding issues)
- **Feeding/Care Updates:** (Relevant context about feeding methods or recent changes)

Keep it highly concise, professional, and objective. Exclude casual chat, greetings, and emotional processing unless it represents a clinical concern (e.g., severe maternal distress). Do not invent information; if a section has no data, omit it.
`;

    const conversationText = history
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Here is the conversation history:\n\n${conversationText}`),
    ]);

    return NextResponse.json({ summary: response.content });
  } catch (error) {
    log.error({ err: error }, 'Failed to generate summary');
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
