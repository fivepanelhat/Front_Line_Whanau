import { describe, expect, it, vi, beforeEach } from 'vitest';

const retrieveRelevantDocumentsMock = vi.fn();

vi.mock('@/ai/rag', () => ({
  retrieveRelevantDocuments: retrieveRelevantDocumentsMock,
}));

describe('knowledge-db lookup', () => {
  beforeEach(() => {
    retrieveRelevantDocumentsMock.mockReset();
  });

  it('uses vector results when available', async () => {
    retrieveRelevantDocumentsMock.mockResolvedValue([
      { content: 'Vector doc 1', source: 'Supabase:doc-1' },
      { content: 'Vector doc 2', source: 'Supabase:doc-2' },
    ]);

    const { lookupKnowledgeContext } = await import('@/ai/knowledge-db');
    const result = await lookupKnowledgeContext('best start payments', { limit: 2 });

    expect(result.retrievalMode).toBe('vector');
    expect(result.context).toContain('Vector doc 1');
    expect(result.sources).toEqual(['Supabase:doc-1', 'Supabase:doc-2']);
  });

  it('falls back to curated knowledge when vector retrieval is unavailable', async () => {
    retrieveRelevantDocumentsMock.mockResolvedValue([]);

    const { lookupKnowledgeContext } = await import('@/ai/knowledge-db');
    const result = await lookupKnowledgeContext('regional iwi support options', { limit: 3 });

    expect(result.retrievalMode).toBe('curated');
    expect(result.context.length).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThan(0);
  });
});
