import { z } from 'zod';

const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
});

export function isSupabasePublicConfigured() {
  return supabasePublicEnvSchema.safeParse(process.env).success;
}

export function getSupabasePublicEnv() {
  const parsed = supabasePublicEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      'Supabase public environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in a root .env.local file.',
    );
  }

  return parsed.data;
}
