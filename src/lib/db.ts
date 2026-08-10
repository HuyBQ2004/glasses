import { supabase, supabaseAdmin } from './supabase';

export async function connectDB() {
  // Supabase uses HTTP/REST connection pooling, so no persistent DB connection logic is required.
  // We return the supabase client instance.
  return { supabase, supabaseAdmin };
}

export { supabase, supabaseAdmin };
