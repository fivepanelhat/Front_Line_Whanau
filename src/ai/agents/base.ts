import { BaseMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentConfig, AgentState } from "../types";
import { getRoleAwareSystemPrompt } from "../utils/prompts";
import { ResponseStyleGuide } from "../tools/response-style-guide";

export abstract class BaseAgent {
  protected llm: ChatGoogleGenerativeAI;

  constructor(protected config: AgentConfig) {
    this.llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",           // Fast and capable
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  abstract getSystemPrompt(state: AgentState): string;

  async invoke(state: AgentState): Promise<Partial<AgentState>> {
    const roleAwarePrompt = getRoleAwareSystemPrompt(
      this.getSystemPrompt(state),
      state.userRole
    );

    const fullSystemPrompt = `${ResponseStyleGuide}\n\n${roleAwarePrompt}`;

    const messages: BaseMessage[] = [
      new SystemMessage(fullSystemPrompt),
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
