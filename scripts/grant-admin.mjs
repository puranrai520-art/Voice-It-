// Grant admin role to a specific user by email
// Run with: node scripts/grant-admin.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim()];
    })
);

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const TARGET_EMAIL = 'puranrai520@gmail.com';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function grantAdmin() {
  // Find user
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', TARGET_EMAIL)
    .single();

  if (fetchError || !user) {
    console.error(`❌ User not found with email: ${TARGET_EMAIL}`);
    console.error('   Make sure the user has signed up first (Clerk webhook must have created them).');
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`✅ ${TARGET_EMAIL} is already an admin. Nothing to do.`);
    process.exit(0);
  }

  // Update role
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (updateError) {
    console.error('❌ Failed to update role:', updateError.message);
    process.exit(1);
  }

  console.log(`✅ Success! ${TARGET_EMAIL} has been granted admin access.`);
  console.log(`   User ID: ${user.id}`);
}

grantAdmin();
