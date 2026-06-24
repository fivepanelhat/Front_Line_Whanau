import { z } from 'zod';

const envSchema = z.object({
  // ── Supabase (required) ────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ error: 'NEXT_PUBLIC_SUPABASE_URL is required' })
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' })
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty'),

  // ── Supabase (server-side only — never exposed to client) ──────────────
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // ── Database ───────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url().optional(),

  // ── AI Provider ───────────────────────────────────────────────────────
  GOOGLE_API_KEY: z.string().min(1).optional(),

  // ── App Settings ──────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Front Line Whānau'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.2.0'),

  // ── Runtime ───────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Validates at startup — crashes fast with clear messages if misconfigured.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(
    `\n\n❌ Invalid environment variables:\n${issues}\n\nCheck your .env.local against .env.example\n`
  );
}

export const env = parsed.data;

/** Type-safe environment variable access */
export type Env = z.infer<typeof envSchema>;
