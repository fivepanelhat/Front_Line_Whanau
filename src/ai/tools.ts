import { tool } from "@langchain/core/tools";
import { retrieveRelevantContext } from "./rag";

export const documentSearchTool = tool(
  async (query: string) => {
    const docs = await retrieveRelevantContext(query);
    return JSON.stringify(docs);
  },
  {
    name: "document_search",
    description: "Search official NZ health support, statutes, and guidelines.",
  }
);
