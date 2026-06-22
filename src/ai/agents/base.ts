import { BaseMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { AgentConfig, AgentState } from "../types";

export abstract class BaseAgent {
  protected llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.3,
  });

  constructor(protected config: AgentConfig) {}

  abstract getSystemPrompt(state: AgentState): string;

  async invoke(state: AgentState): Promise<Partial<AgentState>> {
    const messages: BaseMessage[] = [
      new SystemMessage(this.getSystemPrompt(state)),
      ...state.messages,
    ];

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
