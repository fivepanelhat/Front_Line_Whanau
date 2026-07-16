import { buildAgentMessages } from './history';
import { BaseAgent } from './base';
import { getEmotionalSupportResourcesTool } from '../tools';
import { createAgentLLM } from '../llm';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class Kiwi extends BaseAgent {
 name = 'kiwi';

 private agent = createReactAgent({
 llm: createAgentLLM({ temperature: 0.3 }),
 tools: [getEmotionalSupportResourcesTool],
 prompt: PROMPTS.traumaInformedCompanion,
 });

 constructor() {
 const config: AgentConfig = {
 name: 'kiwi',
 description: 'Provides emotional validation and trauma-informed support language',
 systemPrompt: PROMPTS.traumaInformedCompanion,
 };
 super(config);
 }

 getSystemPrompt(_state: AgentState): string {
 return this.config.systemPrompt;
 }

 async process(query: string, state?: OrchestrationContext): Promise<AgentResponse> {
 const result = await this.agent.invoke({
 messages: buildAgentMessages(query, state),
 });

 const lastMessage = result.messages[result.messages.length - 1];
 const content =
 typeof lastMessage.content === 'string'
 ? lastMessage.content
 : JSON.stringify(lastMessage.content);

 return {
 content,
 confidence: 0.9,
 agentUsed: this.name,
 requiresHumanReview: false,
 };
 }
}
