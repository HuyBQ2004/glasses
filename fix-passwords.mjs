import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://xnarijpflhctrbeamakp.supabase.co';
const supabaseAnonKey = 'sb_publishable_5FbQ4qUH-Z-KHpFCo8Ly8g_-cjUuMme';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixPasswords() {
  const newHash = bcrypt.hashSync('123456', 10);
  console.log('Generated valid bcrypt hash for "123456":', newHash);

  const usernames = ['admin', 'owner1', 'shipper1', 'warehouse1', 'customer1'];

  for (const username of usernames) {
    const { data, error } = await supabase
      .from('accounts')
      .update({ password: newHash })
      .eq('username', username)
      .select();

    if (error) {
      console.error(`Error updating password for ${username}:`, error.message);
    } else {
      console.log(`✅ Updated password for ${username}`);
    }
  }

  // Verify login logic
  const { data: user } = await supabase.from('accounts').select('*').eq('username', 'admin').single();
  if (user) {
    const isValid = bcrypt.compareSync('123456', user.password);
    console.log('🎯 Test login for "admin" / "123456":', isValid ? 'THÀNH CÔNG 🎉' : 'THẤT BẠI ❌');
  }
}

fixPasswords();
