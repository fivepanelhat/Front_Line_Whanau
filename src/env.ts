import { z } from 'zod';

const envSchema = z.object({
 // Public (client-side)
 NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
 NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
 NEXT_PUBLIC_APP_URL: z.string().url().optional(),

 // Server-only
 SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
 DATABASE_URL: z.string().url().optional(),
 JWT_SECRET: z.string().min(32).optional(),
 GOOGLE_API_KEY: z.string().min(1).optional(),
 TAVILY_API_KEY: z.string().min(1).optional(),
 AETHER_SUMMIT_URL: z.string().url().optional(),

 // Optional
 NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
 LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

function parseEnv(): Env {
 if (!cached) {
 cached = envSchema.parse(process.env);
 }
 return cached;
}

// Lazy proxy: defers reading/validating process.env until a property is
// actually accessed, instead of at module-evaluation time. Next.js collects
// page/route data at build time by importing every module, so an eager
// `parse()` here throws during `next build` whenever an env var isn't set
// in the build environment (e.g. CI) even though it will be at runtime.
export const env: Env = new Proxy({} as Env, {
 get(_target, prop: string) {
 return parseEnv()[prop as keyof Env];
 },
});
