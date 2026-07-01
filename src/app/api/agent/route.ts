import { NextRequest, NextResponse } from 'next/server';
import { agentApp } from '@/ai/graph';
import { HumanMessage } from '@langchain/core/messages';
import { requireAuth } from '@/lib/api-auth';
import { RateLimiter } from '@/lib/rate-limit';
import { logger } from '@/utils/logger';
import { z } from 'zod';

const AgentRequestSchema = z.object({
  query: z.string().min(1).max(5000),
  userRole: z.enum(['parent', 'practitioner', 'organisation']),
});

const limiter = new RateLimiter(60_000, 20);

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const allowed = await limiter.check(auth.user.id);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validationResult = AgentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn({ message: 'Invalid API Agent payload', errors: validationResult.error.flatten(), userId: auth.user.id });
      return NextResponse.json(
        { error: 'Invalid request payload', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { query, userRole } = validationResult.data;

    const startTime = Date.now();
    const result = await agentApp.invoke({
      messages: [new HumanMessage(query)],
      userRole,
      query,
    });
    const latencyMs = Date.now() - startTime;
    logger.metric('api_agent_route_latency_ms', latencyMs, { userId: auth.user.id, userRole });

    const responseText = result.messages?.[result.messages.length - 1]?.content || 
                        "Sorry, I couldn't generate a response right now.";

    let responseString = typeof responseText === 'string'
      ? responseText
      : JSON.stringify(responseText);

    // Clean formatting asterisks
    responseString = responseString.replace(/^(\s*)\*\s+/gm, '$1- ');
    responseString = responseString.replace(/\*/g, '');

    logger.info({ message: 'Agent request successful', userId: auth.user.id, latencyMs });
    return NextResponse.json({ response: responseString });
  } catch (error) {
    logger.error({ message: 'AI Agent Error', userId: auth.user.id }, error);
    return NextResponse.json(
      { error: 'Something went wrong with the AI assistant' },
      { status: 500 }
    );
  }
}
