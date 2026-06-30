import 'server-only';
import { BaseAgent } from './base';
import {
  searchDirectoryTool,
  getCulturalResourcesTool,
  knowledgeDatabaseLookupTool,
  findLocalFacilitiesTool,
} from '../tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class ResourceNavigator extends BaseAgent {
  name = 'resource_navigator';

  private agent = createReactAgent({
    llm: new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash', temperature: 0.2 }),
    tools: [knowledgeDatabaseLookupTool, searchDirectoryTool, getCulturalResourcesTool, findLocalFacilitiesTool],
    prompt: `You are a Resource Navigator for preterm whānau in Aotearoa New Zealand.
Your job is to connect families with practical, emotional, cultural, and geographical support.
You can search directories and cultural resources.
Crucially, you can also search the LIVE WEB for practical amenities (e.g. banks, ATMs, supermarkets, doctors, pharmacies, wellness centres) using the findLocalFacilitiesTool.
If a user asks for nearby facilities but hasn't provided their location (e.g., suburb or hospital name), you MUST ask them where they are currently located before searching.`,
  });

  constructor() {
    const config: AgentConfig = {
      name: 'resource_navigator',
      description: 'Maps families to practical support services, local amenities, and directories',
      systemPrompt: `You are a Resource Navigator for preterm whānau in Aotearoa New Zealand.
Your job is to connect families with practical, emotional, cultural, and geographical support.
You can search directories and cultural resources.
Crucially, you can also search the LIVE WEB for practical amenities (e.g. banks, ATMs, supermarkets, doctors, pharmacies, wellness centres) using the findLocalFacilitiesTool.
If a user asks for nearby facilities but hasn't provided their location (e.g., suburb or hospital name), you MUST ask them where they are currently located before searching.`,
    };
    super(config);
  }

  getSystemPrompt(_state: AgentState): string {
    return this.config.systemPrompt;
  }

  async process(query: string, _state?: OrchestrationContext): Promise<AgentResponse> {
    const result = await this.agent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

    return {
      content,
      confidence: 0.86,
      agentUsed: this.name,
      sources: ['Service Directory', 'Cultural Resources', 'Local Facilities Search'],
      requiresHumanReview: false,
    };
  }
}
