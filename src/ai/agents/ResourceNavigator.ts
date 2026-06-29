import 'server-only';
import { BaseAgent } from './base';
import {
  searchDirectoryTool,
  getCulturalResourcesTool,
  knowledgeDatabaseLookupTool,
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
    tools: [knowledgeDatabaseLookupTool, searchDirectoryTool, getCulturalResourcesTool],
    prompt: PROMPTS.resourceNavigator,
  });

  constructor() {
    const config: AgentConfig = {
      name: 'resource_navigator',
      description: 'Maps families to practical support services and directories',
      systemPrompt: PROMPTS.resourceNavigator,
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
      sources: ['Service Directory Tool', 'Cultural Resources Tool'],
      requiresHumanReview: false,
    };
  }
}
