import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import {
  getPretermCareInfoTool,
  getRegionalSupportTool,
  knowledgeDatabaseLookupTool,
} from './tools';
import { PROMPTS } from './prompts';
import { LegacyBaseAgent, AgentResponse, OrchestrationContext } from './types';

export class TaongaKnowledgeWeaver implements LegacyBaseAgent {
  name = 'knowledge_weaver';
  description = 'Provides grounded support information for preterm whanau pathways';

  private agent = createReactAgent({
    llm: new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash', temperature: 0.2 }),
    tools: [knowledgeDatabaseLookupTool, getPretermCareInfoTool, getRegionalSupportTool],
    prompt: PROMPTS.knowledgeWeaver,
  });

  async process(query: string, _state?: OrchestrationContext): Promise<AgentResponse> {
    const result = await this.agent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === 'string'
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    return {
      content,
      confidence: 0.82,
      agentUsed: this.name,
      sources: [],
      requiresHumanReview: false,
    };
  }
}
