import { NextRequest, NextResponse } from 'next/server';
import { agentApp } from '@/ai/graph';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userRole } = body;

    if (!query || !userRole) {
      return NextResponse.json(
        { error: 'Missing query or userRole' },
        { status: 400 }
      );
    }

    const result = await agentApp.invoke({
      messages: [new HumanMessage(query)],
      userRole,
      query,
    });

    const responseText = result.messages?.[result.messages.length - 1]?.content || 
                        "Sorry, I couldn't generate a response right now.";

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('AI Agent Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong with the AI assistant' },
      { status: 500 }
    );
  }
}
