-- ============================================================
-- Migration: 010_public_read_policies.sql
-- Project:   Front Line Whānau
-- Purpose:   The National Directory and approved Whānau Stories are
--            public-facing content, but their RLS SELECT policies were
--            granted TO authenticated only — anonymous visitors saw
--            empty pages. Allow anon read of exactly the published
--            subset (verified+active listings; fully approved stories).
-- ============================================================

CREATE POLICY "directory_listings: anon can read verified active"
  ON public.directory_listings FOR SELECT
  TO anon
  USING (is_active = true AND is_verified = true);

CREATE POLICY "peer_stories: anon can read approved"
  ON public.peer_stories FOR SELECT
  TO anon
  USING (is_approved = true AND cultural_safety_approved = true);
