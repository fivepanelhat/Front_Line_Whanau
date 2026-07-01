import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();

    if (!history || !Array.isArray(history)) {
      return NextResponse.json({ error: 'Missing or invalid history' }, { status: 400 });
    }

    const llm = new ChatGoogleGenerativeAI({
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

    // Combine history into a single text block
    const conversationText = history
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Here is the conversation history:\n\n${conversationText}`)
    ]);

    return NextResponse.json({ summary: response.content });

  } catch (error: any) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
