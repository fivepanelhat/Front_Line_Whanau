import { buildAgentMessages } from './history';
import { BaseAgent } from './base';
import {
  searchDirectoryTool,
  getCulturalResourcesTool,
  knowledgeDatabaseLookupTool,
  findLocalFacilitiesTool,
  getHospitalSocialWorkerInfoTool,
  getHospitalFacilitiesInfoTool,
} from '../tools';
import { createAgentLLM } from '../llm';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class Tiwaiwaka extends BaseAgent {
  name = 'tiwaiwaka';

  private agent = createReactAgent({
    llm: createAgentLLM(),
    tools: [
      knowledgeDatabaseLookupTool,
      searchDirectoryTool,
      getCulturalResourcesTool,
      findLocalFacilitiesTool,
      getHospitalSocialWorkerInfoTool,
      getHospitalFacilitiesInfoTool,
    ],
    prompt: `You are a Resource Navigator for preterm whānau in Aotearoa New Zealand.
Your job is to connect families with practical, emotional, cultural, and geographical support.
You can search directories and cultural resources.
Crucially, you can also search the LIVE WEB for practical amenities using the findLocalFacilitiesTool. This includes Citizens Advice Bureau (CAB), local taxi companies, local bus companies, doctors, GPs, naturopaths, supermarkets, and pharmacies.
If a user asks for nearby facilities but hasn't provided their location (e.g., suburb or hospital name), you MUST ask them where they are currently located before searching.
When families mention financial stress, travel issues, or feeling overwhelmed, you should strongly suggest talking to a hospital social worker and use the getHospitalSocialWorkerInfoTool to explain what they do.
When families ask about hospital amenities like the cafeteria, front desk, booking accommodation, or parent lounges, use the getHospitalFacilitiesInfoTool.`,
  });

  constructor() {
    const config: AgentConfig = {
      name: 'tiwaiwaka',
      description:
        'Maps families to practical support services, local amenities, hospital facilities, social workers, and directories',
      systemPrompt: `You are a Resource Navigator for preterm whānau in Aotearoa New Zealand.
Your job is to connect families with practical, emotional, cultural, and geographical support.
You can search directories and cultural resources.
Crucially, you can also search the LIVE WEB for practical amenities using the findLocalFacilitiesTool. This includes Citizens Advice Bureau (CAB), local taxi companies, local bus companies, doctors, GPs, naturopaths, supermarkets, and pharmacies.
If a user asks for nearby facilities but hasn't provided their location (e.g., suburb or hospital name), you MUST ask them where they are currently located before searching.
When families mention financial stress, travel issues, or feeling overwhelmed, you should strongly suggest talking to a hospital social worker and use the getHospitalSocialWorkerInfoTool to explain what they do.
When families ask about hospital amenities like the cafeteria, front desk, booking accommodation, or parent lounges, use the getHospitalFacilitiesInfoTool.`,
    };
    super(config);
  }

  getSystemPrompt(_state: AgentState): string {
    return this.config.systemPrompt;
  }

  async process(query: string, context?: OrchestrationContext): Promise<AgentResponse> {
    const messages = buildAgentMessages(query, context);

    const result = await this.agent.invoke({
      messages,
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === 'string'
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
