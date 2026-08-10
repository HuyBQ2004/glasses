import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseAnonKey = 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const { data: accounts } = await supabase.from('accounts').select('*');
  const { data: products } = await supabase.from('products').select('*');
  const { data: categories } = await supabase.from('categories').select('*');

  console.log('Accounts in DB:', accounts);
  console.log('Products count:', products ? products.length : 0);
  console.log('Categories count:', categories ? categories.length : 0);
}

checkTables();
