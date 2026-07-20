import { tool } from '@langchain/core/tools';
import { retrieveRelevantContext } from './rag';
import { lookupKnowledgeContext } from './knowledge-db';
import { z } from 'zod';
import { agentLogger } from '@/lib/logger';

const log = agentLogger('Tools');
import { aiToolCache } from '@/lib/cache';
import { TavilySearch } from '@langchain/tavily';

export function createSafeTool<T extends z.ZodTypeAny>(
  config: {
    name: string;
    description: string;
    schema: T;
  },
  func: (input: z.infer<T>) => Promise<any>,
) {
  return tool(async (input: z.infer<T>) => {
    try {
      const result = await func(input);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error: any) {
      log.error({ err: error, tool: config.name }, 'Tool execution error');
      return `Tool execution failed: ${error?.message || 'Unknown error'}. Please try a different approach or let the user know you cannot fulfill this part of the request.`;
    }
  }, config);
}

export const knowledgeDatabaseLookupTool = createSafeTool(
  {
    name: 'knowledge_database_lookup',
    description:
      'Retrieve grounded contextual knowledge from vector database with curated fallback, including source metadata.',
    schema: z.object({
      query: z.string().min(3).describe('User query or topic to search'),
      domain: z
        .enum(['general', 'preterm_care', 'funding', 'cultural', 'regional', 'emotional'])
        .optional()
        .describe('Optional domain hint for retrieval focus'),
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
  },
);

export const documentSearchTool = createSafeTool(
  {
    name: 'document_search',
    description: 'Search official NZ health support, statutes, and guidelines.',
    schema: z.object({
      query: z.string().describe('Search query'),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(query);
  },
);

export const searchDirectoryTool = createSafeTool(
  {
    name: 'search_directory',
    description: 'Search support directories and local service pathways for whanau.',
    schema: z.object({
      query: z.string().describe('Search query'),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(`service directory lookup: ${query}`);
  },
);

export const getCulturalResourcesTool = createSafeTool(
  {
    name: 'get_cultural_resources',
    description:
      'Retrieve culturally grounded support resources including iwi and kaupapa Maori providers.',
    schema: z.object({
      query: z.string().describe('Search query'),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(`maori cultural resource lookup: ${query}`);
  },
);

export const getFundingInfoTool = createSafeTool(
  {
    name: 'get_funding_info',
    description: 'Retrieve official funding and entitlement information for NZ support pathways.',
    schema: z.object({
      query: z.string().describe('Funding topic or question'),
    }),
  },
  async ({ query }) => {
    return await retrieveRelevantContext(`nz funding eligibility lookup: ${query}`);
  },
);

export const getPretermCareInfoTool = createSafeTool(
  {
    name: 'get_preterm_care_info',
    description:
      'Provides safe, high-level information about common preterm care topics. Never gives personalized medical advice.',
    schema: z.object({
      topic: z
        .enum(['feeding', 'breathing', 'skin_to_skin', 'discharge'])
        .describe('The preterm care topic'),
    }),
  },
  async ({ topic }) => {
    const knowledge = await lookupKnowledgeContext(`preterm care ${topic}`, { limit: 4 });
    const safeTopics: Record<string, string> = {
      feeding:
        'Preterm babies often need support with feeding. Your neonatal team will guide you on tube feeding, breastfeeding support, and when your baby is ready for oral feeds.',
      breathing:
        "Many preterm babies need breathing support (CPAP, oxygen, or ventilation) in the early days. Your baby's care team will explain their specific needs.",
      skin_to_skin:
        'Skin-to-skin (kangaroo care) is highly beneficial for preterm babies when they are stable. It helps with bonding, temperature regulation, and development.',
      discharge:
        'Discharge planning for preterm babies involves meeting certain milestones (weight gain, feeding, temperature control). Your team will support you through this process.',
    };
    return {
      content:
        safeTopics[topic.toLowerCase()] ||
        "This is general information. Please speak with your baby's neonatal team for advice specific to your situation.",
      sources: Array.from(
        new Set([
          'Ministry of Health Neonatal Guidelines',
          'Neonatal Care Team',
          ...knowledge.sources,
        ]),
      ),
      disclaimer:
        'This is general information only and not a substitute for professional medical advice.',
      retrievalMode: knowledge.retrievalMode,
    };
  },
);

export const getEmotionalSupportResourcesTool = createSafeTool(
  {
    name: 'get_emotional_support_resources',
    description: 'Returns safe, accessible emotional and peer support options for whanau.',
    schema: z.object({
      focus: z
        .string()
        .optional()
        .describe('Specific focus area e.g. grief, anxiety, partner support'),
    }),
  },
  async ({ focus }) => {
    const knowledge = await lookupKnowledgeContext(`emotional support ${focus || 'general'}`, {
      limit: 4,
    });
    return {
      resources: [
        'Little Miracles Trust - Peer support for preterm whanau',
        '1737 - Need to talk? Free 24/7 support',
        'Perinatal Anxiety & Depression Aotearoa (PADA)',
        'Iwi Maori Mental Health & Addiction Services',
        'Local hospital perinatal mental health team',
      ],
      message:
        "It's okay to not be okay. Reaching out for support is a sign of strength for your whanau.",
      focus: focus || 'general',
      sources: knowledge.sources,
      retrievalMode: knowledge.retrievalMode,
    };
  },
);

export const findLocalFacilitiesTool = createSafeTool(
  {
    name: 'find_local_facilities',
    description:
      'Search the web for real-time practical, geographical, and wellness amenities in Aotearoa New Zealand (e.g. Citizens Advice Bureau / CAB, local taxi companies, local bus companies, doctors, GPs, practitioners, banks, ATMs, supermarkets, pharmacies, naturopaths, wellness centres) near a specific location.',
    schema: z.object({
      query: z
        .string()
        .describe(
          "What the user is looking for (e.g., 'Citizens Advice Bureau', 'taxi', 'bus stop', 'doctor', 'GP', 'supermarket', 'ATM', 'pharmacy', 'naturopath')",
        ),
      location: z
        .string()
        .describe("The user's specific location, suburb, or hospital in Aotearoa New Zealand"),
    }),
  },
  async ({ query, location }) => {
    try {
      // Use Tavily to search the live web for the specific facility in NZ
      const searchQuery = `nearest ${query} near ${location} Aotearoa New Zealand`;

      const results = await aiToolCache.withCache(
        `tavily_${searchQuery}`,
        async () => {
          const searchTool = new TavilySearch({ maxResults: 4 });
          log.info({ searchQuery }, 'Executing live local facilities search via Tavily');
          return await searchTool.invoke({ query: searchQuery });
        },
        1000 * 60 * 60 * 24, // 24-hour cache
      );

      return {
        results,
        disclaimer:
          'These are live web results. Please verify opening hours and availability before traveling.',
      };
    } catch (error) {
      log.error({ err: error }, 'Failed to search local facilities');
      return {
        error: 'Could not retrieve live local facility data at this time.',
      };
    }
  },
);

export const getRegionalSupportTool = createSafeTool(
  {
    name: 'get_regional_support',
    description:
      'Provides high-level information about regional support services for preterm whanau.',
    schema: z.object({
      region: z.string().optional().describe('Region in Aotearoa New Zealand'),
    }),
  },
  async ({ region }) => {
    const knowledge = await lookupKnowledgeContext(`regional support ${region || 'Aotearoa'}`, {
      limit: 4,
    });
    return {
      services: [
        `${region || 'Your region'} - Neonatal Follow-up Clinic`,
        `${region || 'Your region'} - Plunket / Well Child Tamariki Ora`,
        'Local Iwi Health Provider',
        `Parenting support groups in ${region || 'your area'}`,
      ],
      note: 'Services vary by region. We recommend confirming current details with your midwife or social worker.',
      sources: knowledge.sources,
      retrievalMode: knowledge.retrievalMode,
    };
  },
);

let tavily: TavilySearch | null = null;
function getWebSearchTavily(): TavilySearch {
  if (!tavily) {
    tavily = new TavilySearch({
      maxResults: 8,
      includeAnswer: true,
      searchDepth: 'advanced',
    });
  }
  return tavily;
}

export const webSearchTool = createSafeTool(
  {
    name: 'web_search',
    description:
      'Search the web for accurate, up-to-date information. Prioritizes official New Zealand sources. Always cite sources when using search results. CRITICAL: NEVER include personal identifying information (PII), names, or user vault data in your search query. Only search for generic terms.',
    schema: z.object({
      query: z.string().describe('Specific search query, completely stripped of any PII'),
    }),
  },
  async ({ query }) => {
    const enhancedQuery = `${query} (New Zealand OR Aotearoa OR NZ)`;
    return aiToolCache.withCache(
      `web_search_${enhancedQuery}`,
      async () =>
        getWebSearchTavily().invoke({
          query: enhancedQuery,
          includeDomains: [
            'govt.nz',
            'org.nz',
            'health.govt.nz',
            'plunket.org.nz',
            'cab.org.nz',
            'littlemiraclestrust.org.nz',
            'whanauora.nz',
          ],
        }),
      1000 * 60 * 60 * 6, // 6-hour cache: advocacy/eligibility info changes slowly
    );
  },
);

// === Clinical Triage Fallback ===
export const clinicalTriageTool = createSafeTool(
  {
    name: 'clinical_triage_fallback',
    description:
      'Use this tool to get the mandatory safe clinical advice disclaimer based on the severity of the medical symptoms.',
    schema: z.object({
      symptom: z.string().describe('The medical symptom the user is asking about'),
      severity: z
        .enum(['EMERGENCY', 'URGENT', 'INFO'])
        .describe(
          'Classify the symptom severity. EMERGENCY = life-threatening (e.g. chest pain, severe bleeding, unresponsive baby). URGENT = serious but not immediately life threatening (e.g. high fever). INFO = minor questions (e.g. mild rash, general questions).',
        ),
    }),
  },
  async ({ symptom, severity }) => {
    if (severity === 'EMERGENCY') {
      return `WARNING: The symptom "${symptom}" may indicate a life-threatening emergency. Please immediately call 111 for an ambulance or go to your nearest hospital Emergency Department. Do not wait for an AI response.`;
    }
    if (severity === 'URGENT') {
      return `This system cannot provide medical advice for "${symptom}". Please contact Healthline on 0800 611 116 for free registered nurse advice 24/7. For baby-specific concerns, call PlunketLine at 0800 933 922. If it worsens, call 111.`;
    }
    return `For general questions regarding "${symptom}", please consult your GP or healthcare provider. This system cannot provide clinical diagnosis.`;
  },
);

// === Hospital Social Worker Tool ===
export const getHospitalSocialWorkerInfoTool = createSafeTool(
  {
    name: 'get_hospital_social_worker_info',
    description:
      'Provides information about hospital social worker services, what they help with (WINZ forms, accommodation, transport, emotional support), and how to request a referral.',
    schema: z.object({
      topic: z
        .enum(['referral', 'services', 'contact'])
        .optional()
        .describe('Specific aspect of social worker services'),
    }),
  },
  async ({ topic }) => {
    const servicesMap: Record<string, string> = {
      referral:
        "How to Request: You can request a hospital social worker at any time. Simply ask your bedside nurse, the charge nurse, or your baby's doctor to make a referral for you.",
      services:
        'Services include: 1. Financial Support (WINZ, Preterm Baby Payment). 2. Transport & Accommodation (NTA, Ronald McDonald House). 3. Emotional Support. 4. Practical Help (food banks, charities).',
      contact:
        'Social worker availability may vary by hospital. Ask your bedside nurse to contact the on-duty social worker.',
    };

    if (topic && servicesMap[topic]) {
      return {
        overview:
          'Hospital Social Workers are free, confidential, and specialized in supporting whanau.',
        detail: servicesMap[topic],
        disclaimer: 'Services are free and confidential.',
      };
    }

    return {
      overview:
        'Hospital Social Workers are free, confidential, and specialized in supporting whanau during their hospital stay.',
      services: [
        'Financial Support: Help navigating WINZ, filling out forms, and applying for the Preterm Baby Payment.',
        'Transport & Accommodation: Assisting with National Travel Assistance (NTA) registrations and referrals to Ronald McDonald House or hospital family flats.',
        'Emotional Support: Providing a safe space to talk, crisis intervention, and connecting you with community counseling.',
        'Practical Help: Connecting with local charities, food banks, and support groups like The Little Miracles Trust.',
      ],
      howToRequest:
        "You can request a hospital social worker at any time. Simply ask your bedside nurse, the charge nurse, or your baby's doctor to make a referral for you.",
      disclaimer:
        'Social worker availability may vary depending on the specific hospital and current caseload. Services are free and confidential.',
    };
  },
);

// === Hospital Facilities Tool ===
export const getHospitalFacilitiesInfoTool = createSafeTool(
  {
    name: 'get_hospital_facilities_info',
    description:
      'Provides information about common hospital facilities, such as the cafeteria, front desk reception, booking accommodation (whanau rooms), parent lounges, showers, food options, and transport (drop-off zones, Ubers, taxis, buses).',
    schema: z.object({
      topic: z
        .enum([
          'cafeteria',
          'reception',
          'accommodation',
          'facilities',
          'showers',
          'food',
          'transport',
        ])
        .optional()
        .describe('Specific facility to inquire about'),
    }),
  },
  async ({ topic }) => {
    const facilitiesMap: Record<string, string> = {
      cafeteria:
        'Most major hospitals have a cafeteria or cafe usually located near the main entrance/foyer or ground floor. They provide hot meals, coffee, and snacks. Hours vary, but many operate during standard daytime hours, with vending machines available 24/7.',
      reception:
        'The front desk reception is located at the main entrance. They can provide hospital maps, visitor passes, direct you to the NICU/SCBU, and give information about parking validation.',
      accommodation:
        'To book a room or hospital accommodation (such as a Ronald McDonald House, whanau room, or hospital flat), you usually cannot book directly at reception. You must speak to a Hospital Social Worker or the NICU Charge Nurse who will submit a referral based on availability and criteria (like how far you live from the hospital).',
      facilities:
        'Hospitals typically have dedicated parent lounges (with tea/coffee making facilities), breast milk expressing rooms, and multi-faith prayer rooms or chapels. Ask your bedside nurse or ward clerk where these are located on your ward.',
      showers:
        'Whānau showers are usually available in or near the NICU or maternity ward. Ask your bedside nurse where they are located. You may need to bring your own toiletries, though some wards can provide towels.',
      food: 'Hospital supplied kai (meals) are typically provided for the admitted patient (e.g., the mother if she is on a postnatal ward), but usually not for partners or whanau staying in the NICU. You are welcome to bring your own food. Parent lounges usually have a fridge and microwave-make sure to clearly label your food with your name and date. For food deliveries like Uber Eats or Delivereasy, drivers cannot enter the wards; you must meet them at the main hospital entrance or designated drop-off zone.',
      transport:
        'Major hospitals have designated P5 or P10 drop-off/pick-up zones right outside the main entrance. This is where Ubers, Ola, and family members should drop you off. Taxi ranks are usually located immediately next to these main doors. For public transport, most hospitals have local bus stops either directly within the hospital grounds or just outside the main gates. Check your local council transport app for exact routes.',
    };

    if (topic && facilitiesMap[topic]) {
      return {
        overview:
          'Hospitals in Aotearoa provide various facilities to support whanau during their stay.',
        facilityDetail: facilitiesMap[topic],
        disclaimer:
          'Specific facilities and opening hours vary by hospital. Please ask the ward clerk or front reception.',
      };
    }

    return {
      overview:
        'Hospitals in Aotearoa provide various facilities to support whanau during their stay.',
      facilities: facilitiesMap,
      disclaimer:
        'Specific facilities and opening hours vary by hospital. Please ask the ward clerk or front reception for a hospital map or specific details for your location.',
    };
  },
);
