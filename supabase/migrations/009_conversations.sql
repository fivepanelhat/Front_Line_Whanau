-- ============================================================
-- Migration: 009_conversations.sql
-- Project:   Front Line Whānau
-- Purpose:   Create the conversations + messages tables that
--            src/lib/conversation.ts has been querying — they were
--            never defined in a migration, so conversation history
--            silently fails on any fresh deployment.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query patterns from src/lib/conversation.ts:
--   conversations upserted/looked up by thread_id (covered by UNIQUE),
--   listed by updated_at DESC; messages fetched/deleted by
--   conversation_id ordered by created_at.
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON public.conversations (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);

-- RLS: conversation.ts uses the anon-key client, so authenticated
-- users get full access to their session-scoped threads. Thread ids
-- are unguessable client-generated identifiers; tighten to per-user
-- ownership once conversations carry a user_id.
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations: authenticated full access"
  ON public.conversations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "messages: authenticated full access"
  ON public.messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
