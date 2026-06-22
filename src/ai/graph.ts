import { StateGraph, END, interrupt } from "@langchain/langgraph";
import { AgentState } from "./types";
import { AetherSummit } from "./agents/aether-summit";
import { retrieveRelevantContext } from "./rag";

const graph = new StateGraph<AgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    currentAgent: { value: (x, y) => y ?? x },
    userRole: { value: (x, y) => y ?? x },
    query: { value: (x, y) => y ?? x },
    context: { value: (x, y) => y ?? x },
    results: { value: (x, y) => y ?? x },
    needsHumanReview: { value: (x, y) => y ?? x },
    humanApproved: { value: (x, y) => y ?? x },
  },
});

const aetherSummit = new AetherSummit();

graph.addNode("retrieve_context", async (state) => {
  if (!state.query) return {};
  const context = await retrieveRelevantContext(state.query);
  return { context };
});

graph.addNode("aether_summit", aetherSummit.invoke.bind(aetherSummit));

// HITL Review Node
graph.addNode("human_review", async (state) => {
  if (state.humanApproved) {
    return {}; // Already approved, continue
  }

  // Interrupt and ask for human approval
  const reviewRequest = interrupt({
    message: "This response requires human review before being shown to the user.",
    currentAgent: state.currentAgent,
    proposedResponse: state.messages[state.messages.length - 1]?.content,
  }) as any;

  return {
    humanApproved: reviewRequest.approved,
    messages: reviewRequest.approved 
      ? state.messages 
      : [...state.messages, { role: "human", content: reviewRequest.feedback }],
  };
});

(graph as any).setEntryPoint("retrieve_context");
(graph as any).addEdge("retrieve_context", "aether_summit");

// Conditional edge for HITL
(graph as any).addConditionalEdges(
  "aether_summit",
  (state: AgentState) => {
    const sensitiveAgents = ["rangahau_hauora", "mana_awhina", "aroha_tohunga"];
    if (sensitiveAgents.includes(state.currentAgent || "")) {
      return "human_review";
    }
    return END;
  },
  {
    human_review: "human_review",
    [END]: END,
  }
);

(graph as any).addEdge("human_review", END);

export const agentApp = graph.compile();
