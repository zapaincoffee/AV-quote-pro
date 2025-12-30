import { createClient } from '@supabase/supabase-js';

// Environment variables are preferred for API routes
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing from environment variables. Please ensure them.');
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
