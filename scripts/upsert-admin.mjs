// Upsert admin user directly via Supabase REST API
// Works without pg - uses the Supabase service role key via fetch
// Run with: node scripts/upsert-admin.mjs

import { readFileSync } from 'fs';
import { resolve } from 'path';

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

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];
const TARGET_EMAIL = env['ADMIN_EMAIL'] || 'puranrai520@gmail.com';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function run() {
  console.log(`\n🔍 Looking up user: ${TARGET_EMAIL}`);
  
  // 1. Check if user exists
  const findRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(TARGET_EMAIL)}&select=id,email,name,role`,
    { headers }
  );
  const users = await findRes.json();
  
  if (!Array.isArray(users) || users.length === 0) {
    console.log(`⚠️  User not found in database yet.`);
    console.log(`   This means the user has not completed sign-in through the app yet.`);
    console.log(`\n📋 All users currently in the database:`);
    
    const allRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,email,name,role,created_at&order=created_at.asc`,
      { headers }
    );
    const allUsers = await allRes.json();
    
    if (allUsers.length === 0) {
      console.log('   (empty - no users have signed in yet)');
      console.log(`\n✅ SOLUTION: Start the app (npm run dev), go to http://localhost:3000/sign-in`);
      console.log(`   Sign in with ${TARGET_EMAIL} and you will automatically get admin role!`);
    } else {
      allUsers.forEach(u => console.log(`   - ${u.email} [${u.role}]`));
      console.log(`\n✅ SOLUTION: Sign in with ${TARGET_EMAIL} and the ADMIN_EMAIL setting will auto-promote you.`);
    }
    return;
  }
  
  const user = users[0];
  console.log(`✅ Found user: ${user.name || user.email} (current role: ${user.role})`);
  
  if (user.role === 'admin') {
    console.log(`🎉 Already admin! No changes needed.`);
    return;
  }
  
  // 2. Update to admin
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role: 'admin' }),
    }
  );
  
  if (updateRes.ok) {
    console.log(`🎉 SUCCESS! ${TARGET_EMAIL} is now an admin!`);
    console.log(`   Refresh your browser or sign in again to see the admin panel.`);
  } else {
    const err = await updateRes.text();
    console.error(`❌ Failed to update:`, err);
  }
}

run().catch(console.error);
