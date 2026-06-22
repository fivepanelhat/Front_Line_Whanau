import { StateGraph, END } from "@langchain/langgraph";
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
  },
});

const aetherSummit = new AetherSummit();

graph.addNode("retrieve_context", async (state) => {
  if (!state.query) return {};
  const context = await retrieveRelevantContext(state.query);
  return { context };
});

graph.addNode("aether_summit", aetherSummit.invoke.bind(aetherSummit));

(graph as any).setEntryPoint("retrieve_context");
(graph as any).addEdge("retrieve_context", "aether_summit");
(graph as any).addEdge("aether_summit", END);

export const agentApp = graph.compile();
