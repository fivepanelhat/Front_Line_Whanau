import { tool } from "@langchain/core/tools";
import { retrieveRelevantContext } from "./rag";
import { z } from "zod";

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

export const getPretermCareInfoTool = tool(
  async ({ topic }: { topic: "feeding" | "breathing" | "skin_to_skin" | "discharge" }) => {
    const safeTopics: Record<string, string> = {
      feeding:
        "Preterm babies often need support with feeding. Your neonatal team will guide you on tube feeding, breastfeeding support, and when your baby is ready for oral feeds.",
      breathing:
        "Many preterm babies need breathing support (CPAP, oxygen, or ventilation) in the early days. Your baby's care team will explain their specific needs.",
      skin_to_skin:
        "Skin-to-skin (kangaroo care) is highly beneficial for preterm babies when they are stable. It helps with bonding, temperature regulation, and development.",
      discharge:
        "Discharge planning for preterm babies involves meeting certain milestones (weight gain, feeding, temperature control). Your team will support you through this process.",
    };

    return {
      content:
        safeTopics[topic.toLowerCase()] ||
        "This is general information. Please speak with your baby's neonatal team for advice specific to your situation.",
      sources: ["Ministry of Health Neonatal Guidelines", "Neonatal Care Team"],
      disclaimer:
        "This is general information only and not a substitute for professional medical advice.",
    };
  },
  {
    name: "get_preterm_care_info",
    description:
      "Provides safe, high-level information about common preterm care topics. Never gives personalized medical advice.",
    schema: z.object({
      topic: z
        .enum(["feeding", "breathing", "skin_to_skin", "discharge"])
        .describe("The preterm care topic"),
    }),
  }
);

export const getEmotionalSupportResourcesTool = tool(
  async ({ focus }: { focus?: string }) => {
    return {
      resources: [
        "Little Miracles Trust - Peer support for preterm whanau",
        "1737 - Need to talk? Free 24/7 support",
        "Perinatal Anxiety & Depression Aotearoa (PADA)",
        "Iwi Maori Mental Health & Addiction Services",
        "Local hospital perinatal mental health team",
      ],
      message:
        "It's okay to not be okay. Reaching out for support is a sign of strength for your whanau.",
      focus: focus || "general",
    };
  },
  {
    name: "get_emotional_support_resources",
    description: "Returns safe, accessible emotional and peer support options for whanau.",
    schema: z.object({
      focus: z.string().optional().describe("Specific focus area e.g. grief, anxiety, partner support"),
    }),
  }
);

export const getRegionalSupportTool = tool(
  async ({ region }: { region?: string }) => {
    return {
      services: [
        `${region || "Your region"} - Neonatal Follow-up Clinic`,
        `${region || "Your region"} - Plunket / Well Child Tamariki Ora`,
        "Local Iwi Health Provider",
        `Parenting support groups in ${region || "your area"}`,
      ],
      note:
        "Services vary by region. We recommend confirming current details with your midwife or social worker.",
    };
  },
  {
    name: "get_regional_support",
    description:
      "Provides high-level information about regional support services for preterm whanau.",
    schema: z.object({
      region: z.string().optional().describe("Region in Aotearoa New Zealand"),
    }),
  }
);
