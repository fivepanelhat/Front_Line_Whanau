import { tool } from "@langchain/core/tools";
import { retrieveRelevantContext } from "./rag";
import { lookupKnowledgeContext } from "./knowledge-db";
import { z } from "zod";
import { agentLogger } from '@/lib/logger';

const log = agentLogger('Tools');
import { TavilySearch } from "@langchain/tavily";

export function createSafeTool<T extends z.ZodTypeAny>(
  config: {
    name: string;
    description: string;
    schema: T;
  },
  func: (input: z.infer<T>) => Promise<any>
) {
  return tool(
    async (input: z.infer<T>) => {
      try {
        const result = await func(input);
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (error: any) {
        log.error({ err: error, tool: config.name }, 'Tool execution error');
        return JSON.stringify({
          error: `Tool execution failed: ${error?.message || 'Unknown error'}. Please try a different approach.`
        });
      }
    },
    config
  );
}

export const knowledgeDatabaseLookupTool = createSafeTool(
  {
    name: "knowledge_database_lookup",
    description: "Retrieve grounded contextual knowledge from vector database with curated fallback, including source metadata.",
    schema: z.object({
      query: z.string().min(3).describe("User query or topic to search"),
      domain: z.enum(["general", "preterm_care", "funding", "cultural", "regional", "emotional"]).optional().describe("Optional domain hint for retrieval focus"),
    }),
  },
  async ({ query, domain }) => {
    const enrichedQuery = domain ? `${domain} ${query}` : query;
    const result = await lookupKnowledgeContext(enrichedQuery, { limit: 6 });
    return {
      content: result.context,
      sources: result.sources,
      retrievalMode: result.retrievalMode,
      query: enrichedQuery,
    };
  }
);

export const documentSearchTool = createSafeTool(
  {
    name: "document_search",
    description: "Search official NZ health support, statutes, and guidelines.",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(query);
  }
);

export const searchDirectoryTool = createSafeTool(
  {
    name: "search_directory",
    description: "Search support directories and local service pathways for whanau.",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(`service directory lookup: ${query}`);
  }
);

export const getCulturalResourcesTool = createSafeTool(
  {
    name: "get_cultural_resources",
    description: "Retrieve culturally grounded support resources including iwi and kaupapa Maori providers.",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(`maori cultural resource lookup: ${query}`);
  }
);

export const getFundingInfoTool = createSafeTool(
  {
    name: "get_funding_info",
    description: "Retrieve official funding and entitlement information for NZ support pathways.",
    schema: z.object({
      query: z.string().describe("Funding topic or question"),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(`nz funding eligibility lookup: ${query}`);
  }
);

export const getPretermCareInfoTool = createSafeTool(
  {
    name: "get_preterm_care_info",
    description: "Provides safe, high-level information about common preterm care topics. Never gives personalized medical advice.",
    schema: z.object({
      topic: z.enum(["feeding", "breathing", "skin_to_skin", "discharge"]).describe("The preterm care topic"),
    }),
  },
  async ({ topic }) => {
    const knowledge = await lookupKnowledgeContext(`preterm care ${topic}`, { limit: 4 });
    const safeTopics: Record<string, string> = {
      feeding: "Preterm babies often need support with feeding. Your neonatal team will guide you on tube feeding, breastfeeding support, and when your baby is ready for oral feeds.",
      breathing: "Many preterm babies need breathing support (CPAP, oxygen, or ventilation) in the early days. Your baby's care team will explain their specific needs.",
      skin_to_skin: "Skin-to-skin (kangaroo care) is highly beneficial for preterm babies when they are stable. It helps with bonding, temperature regulation, and development.",
      discharge: "Discharge planning for preterm babies involves meeting certain milestones (weight gain, feeding, temperature control). Your team will support you through this process.",
    };
    return {
      content: safeTopics[topic.toLowerCase()] || "This is general information. Please speak with your baby's neonatal team for advice specific to your situation.",
      sources: Array.from(new Set(["Ministry of Health Neonatal Guidelines", "Neonatal Care Team", ...knowledge.sources])),
      disclaimer: "This is general information only and not a substitute for professional medical advice.",
      retrievalMode: knowledge.retrievalMode,
    };
  }
);

export const getEmotionalSupportResourcesTool = createSafeTool(
  {
    name: "get_emotional_support_resources",
    description: "Returns safe, accessible emotional and peer support options for whanau.",
    schema: z.object({
      focus: z.string().optional().describe("Specific focus area e.g. grief, anxiety, partner support"),
    }),
  },
  async ({ focus }) => {
    const knowledge = await lookupKnowledgeContext(`emotional support ${focus || "general"}`, { limit: 4 });
    return {
      resources: [
        "Little Miracles Trust - Peer support for preterm whanau",
        "1737 - Need to talk? Free 24/7 support",
        "Perinatal Anxiety & Depression Aotearoa (PADA)",
        "Iwi Maori Mental Health & Addiction Services",
        "Local hospital perinatal mental health team",
      ],
      message: "It's okay to not be okay. Reaching out for support is a sign of strength for your whanau.",
      focus: focus || "general",
      sources: knowledge.sources,
      retrievalMode: knowledge.retrievalMode,
    };
  }
);

export const findLocalFacilitiesTool = createSafeTool(
  {
    name: "find_local_facilities",
    description: "Search the web for real-time practical and geographical amenities in Aotearoa New Zealand (e.g. banks, ATMs, supermarkets, doctors, pharmacies, wellness centres) near a specific location.",
    schema: z.object({
      query: z.string().describe("What the user is looking for (e.g., 'supermarket', 'ATM', 'doctor', 'pharmacy')"),
      location: z.string().describe("The user's specific location, suburb, or hospital in Aotearoa New Zealand"),
    }),
  },
  async ({ query, location }) => {
    try {
      // Use Tavily to search the live web for the specific facility in NZ
      const searchTool = new TavilySearch({ maxResults: 4 });
      const searchQuery = `nearest ${query} near ${location} Aotearoa New Zealand`;
      
      log.info({ searchQuery }, 'Executing live local facilities search via Tavily');
      
      const results = await searchTool.invoke({ query: searchQuery });
      
      return {
        results,
        disclaimer: "These are live web results. Please verify opening hours and availability before traveling."
      };
    } catch (error) {
      log.error({ err: error }, 'Failed to search local facilities');
      return {
        error: "Could not retrieve live local facility data at this time."
      };
    }
  }
);

export const getRegionalSupportTool = createSafeTool(
  {
    name: "get_regional_support",
    description: "Provides high-level information about regional support services for preterm whanau.",
    schema: z.object({
      region: z.string().optional().describe("Region in Aotearoa New Zealand"),
    }),
  },
  async ({ region }) => {
    const knowledge = await lookupKnowledgeContext(`regional support ${region || "Aotearoa"}`, { limit: 4 });
    return {
      services: [
        `${region || "Your region"} - Neonatal Follow-up Clinic`,
        `${region || "Your region"} - Plunket / Well Child Tamariki Ora`,
        "Local Iwi Health Provider",
        `Parenting support groups in ${region || "your area"}`,
      ],
      note: "Services vary by region. We recommend confirming current details with your midwife or social worker.",
      sources: knowledge.sources,
      retrievalMode: knowledge.retrievalMode,
    };
  }
);

const tavily = new TavilySearch({
  maxResults: 8,
  includeAnswer: true,
  searchDepth: "advanced",
});

export const webSearchTool = createSafeTool(
  {
    name: "web_search",
    description: "Search the web for accurate, up-to-date information. Prioritizes official New Zealand sources. Always cite sources when using search results. CRITICAL: NEVER include personal identifying information (PII), names, or user vault data in your search query. Only search for generic terms.",
    schema: z.object({
      query: z.string().describe("Specific search query, completely stripped of any PII"),
    }),
  },
  async ({ query }) => {
    const enhancedQuery = `${query} (New Zealand OR Aotearoa OR NZ)`;
    const results = await tavily.invoke({
      query: enhancedQuery,
      includeDomains: [
        "govt.nz",
        "org.nz",
        "health.govt.nz",
        "plunket.org.nz",
        "cab.org.nz",
        "littlemiraclestrust.org.nz",
        "whanauora.nz",
      ],
    });
    return results;
  }
);
