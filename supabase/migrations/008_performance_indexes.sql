-- ============================================================
-- Migration: 008_performance_indexes.sql
-- Project:   Front Line Whānau
-- Purpose:   Fix schema drift and add indexes matching the actual
--            filter/order patterns used by the API routes.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- SCHEMA DRIFT: `ai_feedback.agent` is read/written by
-- src/app/api/feedback/route.ts, feedback/stats/route.ts, and
-- practitioner/feedback/route.ts but was never added by 007_feedback.sql.
-- Every feedback submission that includes an agent name currently
-- fails at insert time.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.ai_feedback ADD COLUMN IF NOT EXISTS agent TEXT;

-- ────────────────────────────────────────────────────────────
-- practitioner_notes: filtered by practitioner_id, ordered by created_at
-- (src/app/api/practitioner/notes/route.ts)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_practitioner_notes_practitioner_created
  ON public.practitioner_notes (practitioner_id, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- ai_reviews: looked up by thread_id+status (review/route.ts), by
-- thread_id ordered by created_at (review/status/route.ts), and by
-- status ordered by created_at (review/queue/route.ts)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_reviews_thread_status
  ON public.ai_reviews (thread_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_reviews_status_created
  ON public.ai_reviews (status, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- peer_stories: public feed filters on is_approved + cultural_safety_approved,
-- ordered by created_at (src/app/api/stories/route.ts)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_peer_stories_approved_created
  ON public.peer_stories (is_approved, cultural_safety_approved, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- directory_listings: public read policy filters on is_active + is_verified
-- (RLS policy in 001_core_rls_policies.sql)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_directory_listings_verified_active
  ON public.directory_listings (is_verified, is_active);

-- ────────────────────────────────────────────────────────────
-- ai_feedback: stats/export routes filter by created_at range and by agent
-- (src/app/api/feedback/stats/route.ts, feedback/export/route.ts)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created_at
  ON public.ai_feedback (created_at);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_agent
  ON public.ai_feedback (agent);

-- ────────────────────────────────────────────────────────────
-- document_embeddings: match_documents() does a cosine-distance search
-- (src/ai/rag.ts) on every RAG query. Without a vector index this is a
-- full-table brute-force scan. HNSW gives approximate nearest-neighbour
-- search with good recall and doesn't need a pre-existing data sample
-- to build (unlike ivfflat, which needs enough rows to pick sensible
-- clusters), so it's safe to create even before this table has data.
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding_cosine
  ON public.document_embeddings
  USING hnsw (embedding vector_cosine_ops);
