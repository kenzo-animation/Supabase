import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/profile'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null

export function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local.',
    )
  }
  return supabase
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}