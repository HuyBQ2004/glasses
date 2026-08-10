import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseAnonKey = 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateLogin(username, password) {
  console.log(`\n🔑 Testing login flow for username="${username}", password="${password}"`);

  const { data: user, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('❌ Supabase Query Error:', error.message, error);
    return;
  }

  if (!user) {
    console.error('❌ User not found!');
    return;
  }

  console.log('✅ User found in DB:', { id: user.id, username: user.username, role: user.role, active: user.active });
  console.log('Stored Password Hash in DB:', user.password);

  const isPasswordValid = bcrypt.compareSync(password, user.password || '');
  console.log('Bcrypt compare result:', isPasswordValid);

  if (!isPasswordValid) {
    console.error('❌ Password comparison failed!');
  } else {
    console.log('🎉 LOGIN SUCCESSFUL!');
  }
}

async function runTests() {
  await simulateLogin('admin', '123456');
  await simulateLogin('customer1', '123456');
}

runTests();
