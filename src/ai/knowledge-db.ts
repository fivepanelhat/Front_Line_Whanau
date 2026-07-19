import { retrieveRelevantDocuments, type RetrievedKnowledgeDocument } from './rag';

export interface KnowledgeRecord {
  title: string;
  content: string;
  source: string;
  tags: string[];
}

// Curated safety-first fallback knowledge when vector retrieval is unavailable.
const curatedKnowledgeBase: KnowledgeRecord[] = [
  {
    title: 'Preterm Care Basics',
    content:
      'Preterm care often includes feeding support, breathing support, skin-to-skin care, and discharge preparation with neonatal guidance.',
    source: 'Ministry of Health - Neonatal Care Guidance',
    tags: ['preterm', 'care', 'feeding', 'breathing', 'skin_to_skin', 'discharge'],
  },
  {
    title: 'Funding and Entitlements',
    content:
      'Whānau may be eligible for supports such as Best Start and Work and Income assistance. Eligibility varies and should be confirmed with official services.',
    source: 'Work and Income NZ',
    tags: ['funding', 'best start', 'winz', 'entitlements', 'financial'],
  },
  {
    title: 'Regional and Cultural Support',
    content:
      'Local support can include neonatal follow-up clinics, Plunket services, iwi and kaupapa Māori providers, and peer support groups.',
    source: 'Te Whatu Ora + Local Iwi Health Providers',
    tags: ['regional', 'support', 'iwi', 'maori', 'directory'],
  },
  {
    title: 'Emotional Support Pathways',
    content:
      'Emotional support options include Little Miracles Trust, 1737, PADA, and local perinatal mental health teams.',
    source: '1737 / PADA / Little Miracles Trust',
    tags: ['emotional', 'trauma', 'mental health', 'support'],
  },
];

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreRecord(queryTokens: string[], record: KnowledgeRecord): number {
  const combined = `${record.title} ${record.content} ${record.tags.join(' ')}`.toLowerCase();
  return queryTokens.reduce((score, token) => (combined.includes(token) ? score + 1 : score), 0);
}

function searchCuratedKnowledge(query: string, limit: number): KnowledgeRecord[] {
  const tokens = tokenize(query);
  const scored = curatedKnowledgeBase
    .map((record) => ({ record, score: scoreRecord(tokens, record) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.record);

  if (scored.length > 0) {
    return scored;
  }

  return curatedKnowledgeBase.slice(0, limit);
}

function uniqueSourcesFromVector(docs: RetrievedKnowledgeDocument[]): string[] {
  return Array.from(new Set(docs.map((doc) => doc.source))).filter(Boolean);
}

export interface KnowledgeLookupResult {
  context: string;
  sources: string[];
  retrievalMode: 'vector' | 'curated';
}

export async function lookupKnowledgeContext(
  query: string,
  options?: { limit?: number },
): Promise<KnowledgeLookupResult> {
  const limit = options?.limit ?? 6;
  const vectorDocs = await retrieveRelevantDocuments(query, limit);

  if (vectorDocs.length > 0) {
    return {
      context: vectorDocs.map((doc) => doc.content).join('\n\n---\n\n'),
      sources: uniqueSourcesFromVector(vectorDocs),
      retrievalMode: 'vector',
    };
  }

  const curatedDocs = searchCuratedKnowledge(query, Math.min(limit, 4));
  return {
    context: curatedDocs.map((doc) => doc.content).join('\n\n---\n\n'),
    sources: curatedDocs.map((doc) => doc.source),
    retrievalMode: 'curated',
  };
}
