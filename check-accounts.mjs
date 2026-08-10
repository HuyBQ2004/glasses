import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseAnonKey = 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAccounts() {
  const { data, error } = await supabase.from('accounts').select('*');
  console.log('Error:', error);
  console.log('Accounts data:', data);
}

checkAccounts();
