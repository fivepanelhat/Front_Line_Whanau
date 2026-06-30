// src/ai/knowledge-weaver.ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PROMPTS } from "./prompts";
import { webSearchTool } from "./tools";

const knowledgeLLM = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2,
});

export const knowledgeWeaverAgent = createReactAgent({
  llm: knowledgeLLM,
  tools: [webSearchTool],
  prompt: PROMPTS.knowledgeWeaver,
});

export class TaongaKnowledgeWeaver {
  name = "knowledge_weaver";

  async process(query: string, state: any) {
    const result = await knowledgeWeaverAgent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    let content = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

    // Only append sources if LLM didn't already include them
    const hasCitation = content.includes('[') || content.toLowerCase().includes('source');
    
    // Fallback to extract tool outputs if result.tool_outputs isn't natively populated by LangGraph
    const toolMessages = result.messages.filter((m: any) => m._getType() === 'tool');
    const toolOutputs = (result as any).tool_outputs || (toolMessages.length > 0 ? toolMessages.map((m: any) => {
        try { return JSON.parse(m.content); } catch { return { url: m.content }; }
    }).flat() : null);

    if (!hasCitation && toolOutputs) {
      content += formatSources(toolOutputs);
    }

    return {
      content,
      agentUsed: this.name,
      requiresHumanReview: false,
      confidence: 0.85,
      sources: [],
    };
  }
}

function formatSources(toolResults: any): string {
  if (!toolResults) return '';

  const results = Array.isArray(toolResults) ? toolResults : [toolResults];
  const sources: string[] = [];

  results.forEach((result, index) => {
    if (!result) return;

    const title = result.title || result.url || `Source ${index + 1}`;
    const url = result.url || '';

    if (url) {
      sources.push(`${index + 1}. ${title} – ${url}`);
    }
  });

  if (sources.length === 0) return '';

  return '\n\nSources:\n' + sources.slice(0, 6).join('\n');
}
