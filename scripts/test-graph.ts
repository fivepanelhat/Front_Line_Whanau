import { agentApp } from "../src/ai/graph";
import { AgentState } from "../src/ai/types";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  console.log("Invoking LangGraph workflow...");
  try {
    const result = (await agentApp.invoke({
      messages: [new HumanMessage("What financial support is available for parents of preterm twins?")],
      userRole: "parent",
      query: "What financial support is available for parents of preterm twins?",
    })) as any;

    console.log("\nResponse:\n");
    console.log(result.messages[result.messages.length - 1].content);
  } catch (error) {
    console.error("Error invoking graph:", error);
  }
}

main();
