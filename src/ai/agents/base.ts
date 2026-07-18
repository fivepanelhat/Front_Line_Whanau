import { BaseMessage, SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentConfig, AgentState } from '@/ai/types';
import { getRoleAwareSystemPrompt } from '../utils/prompts';
import { ResponseStyleGuide } from '../tools/response-style-guide';
import { createAgentLLM } from '../llm';

export abstract class BaseAgent {
  protected llm: ChatGoogleGenerativeAI;

  constructor(protected config: AgentConfig) {
    // Use shared factory so builds without GOOGLE_API_KEY still evaluate modules.
    this.llm = createAgentLLM({
      model: 'gemini-2.5-flash',
      temperature: 0.7,
    });
  }

  abstract getSystemPrompt(state: AgentState): string;

  async invoke(state: AgentState): Promise<Partial<AgentState>> {
    const roleAwarePrompt = getRoleAwareSystemPrompt(this.getSystemPrompt(state), state.userRole);

    const fullSystemPrompt = `${ResponseStyleGuide}\n\n${roleAwarePrompt}`;

    const messages: BaseMessage[] = [new SystemMessage(fullSystemPrompt), ...state.messages];

    if (state.query) {
      messages.push(new HumanMessage(state.query));
    }

    const response = await this.llm.invoke(messages);

    return {
      messages: [response],
      currentAgent: this.config.name,
    };
  }
}
