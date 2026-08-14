import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cyhauxixcysfvsguqnyx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 10);

// If anon key is missing, create a safe fallback client so the frontend never crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      rpc: async () => ({
        data: null,
        error: new Error('VITE_SUPABASE_ANON_KEY no configurado en .env'),
      }),
      from: () => ({
        select: async () => ({
          data: null,
          error: new Error('VITE_SUPABASE_ANON_KEY no configurado en .env'),
        }),
      }),
    };
