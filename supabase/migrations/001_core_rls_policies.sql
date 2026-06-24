-- ============================================================
-- Migration: 001_core_rls_policies.sql
-- Project:   Front Line Whānau
-- Purpose:   Enable Row Level Security and define core access
--            policies for all user-facing tables.
--
-- Principles:
--   • Deny by default — RLS is enabled on all tables.
--   • Users can only read/write their own rows.
--   • Public directory listings are readable by all authenticated users.
--   • Service role (admin client) bypasses RLS for admin operations.
--   • All policies are named descriptively for easy auditing.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- Each user has exactly one profile row (matches auth.users.id).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('parent', 'practitioner', 'admin')),
  display_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile only
CREATE POLICY "profiles: owner can read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile only
CREATE POLICY "profiles: owner can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is auto-created via trigger (no direct INSERT from client)
-- Insert is handled server-side via service role after sign-up.


-- ────────────────────────────────────────────────────────────
-- CONSENT RECORDS
-- Privacy-sensitive — strict owner-only access.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted     BOOLEAN NOT NULL DEFAULT false,
  granted_at  TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_records: owner can read"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "consent_records: owner can insert"
  ON public.consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consent_records: owner can update"
  ON public.consent_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No DELETE — consent records are immutable for audit purposes.


-- ────────────────────────────────────────────────────────────
-- DIRECTORY LISTINGS
-- Public read for all authenticated users.
-- Write restricted to practitioners (via profile role check) and admins.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.directory_listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  organisation  TEXT NOT NULL,
  service_type  TEXT NOT NULL,
  region        TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website_url   TEXT,
  description   TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.directory_listings ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can browse active, verified listings
CREATE POLICY "directory_listings: authenticated users can read active"
  ON public.directory_listings FOR SELECT
  TO authenticated
  USING (is_active = true AND is_verified = true);

-- Practitioners can insert listings (their profile role must be 'practitioner')
CREATE POLICY "directory_listings: practitioners can insert"
  ON public.directory_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('practitioner', 'admin')
    )
  );

-- Owners can update their own listings; admins can update all
CREATE POLICY "directory_listings: owner or admin can update"
  ON public.directory_listings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────
-- DOCUMENTS / UPLOADS
-- Strict owner-only access. No cross-user reads.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  filename     TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size    BIGINT,
  mime_type    TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents: owner can read"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "documents: owner can insert"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents: owner can delete"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- No UPDATE — documents should be immutable once uploaded.


-- ────────────────────────────────────────────────────────────
-- SUPPORT THREADS (if/when added)
-- Visible only to the user who created them.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_threads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_threads: owner can read"
  ON public.support_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "support_threads: owner can insert"
  ON public.support_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_threads: owner can update status"
  ON public.support_threads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- TRIGGER: Auto-create profile on sign-up
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
