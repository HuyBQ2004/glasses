import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Standard Supabase client (Anon) - dành cho client & truy vấn công khai
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin Supabase client (Service Role) - chỉ dùng ở phía server
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);


