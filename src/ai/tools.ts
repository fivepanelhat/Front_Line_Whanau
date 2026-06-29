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

export const searchDirectoryTool = tool(
  async (query: string) => {
    const docs = await retrieveRelevantContext(`service directory lookup: ${query}`);
    return JSON.stringify(docs);
  },
  {
    name: "search_directory",
    description: "Search support directories and local service pathways for whanau.",
  }
);

export const getCulturalResourcesTool = tool(
  async (query: string) => {
    const docs = await retrieveRelevantContext(`maori cultural resource lookup: ${query}`);
    return JSON.stringify(docs);
  },
  {
    name: "get_cultural_resources",
    description: "Retrieve culturally grounded support resources including iwi and kaupapa Maori providers.",
  }
);

export const getFundingInfoTool = tool(
  async (query: string) => {
    const docs = await retrieveRelevantContext(`nz funding eligibility lookup: ${query}`);
    return JSON.stringify(docs);
  },
  {
    name: "get_funding_info",
    description: "Retrieve official funding and entitlement information for NZ support pathways.",
  }
);
