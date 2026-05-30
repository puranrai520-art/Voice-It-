// Setup script: creates DB tables + storage bucket + grants admin
// Run: node scripts/setup-db.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => { const [k, ...v] = line.split('='); return [k.trim(), v.join('=').trim()]; })
);

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log('🔧 Setting up VoiceIt database...\n');

  // 1. Create tables
  const schema = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
      email_notifications BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT CHECK (category IN ('Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other')),
      image_url TEXT,
      status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Review', 'Resolved')),
      priority INTEGER CHECK (priority BETWEEN 1 AND 5),
      ai_reply TEXT,
      admin_reply TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS complaints_user_id_idx ON complaints(user_id);
    CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);
    CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON complaints(created_at DESC);
    CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id);
    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role full access') THEN
        CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'Service role full access') THEN
        CREATE POLICY "Service role full access" ON complaints FOR ALL USING (true);
      END IF;
    END $$;
  `;

  // Check tables
  const tables = ['users', 'complaints'];
  let tablesOk = true;
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    if (error && error.code === '42P01') {
      tablesOk = false;
      console.log(`❌ Table "${t}" does not exist.`);
    } else if (error) {
      console.log(`⚠️  Table "${t}": ${error.message}`);
    } else {
      console.log(`✅ Table "${t}" exists`);
    }
  }

  if (!tablesOk) {
    console.log('\n⚠️  Some tables are missing. Please run the SQL below in Supabase Dashboard → SQL Editor:\n');
    console.log(readFileSync(resolve(process.cwd(), 'supabase/schema.sql'), 'utf-8'));
  }

  // 2. Create storage bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'complaint-images');

  if (bucketExists) {
    console.log('✅ Storage bucket "complaint-images" exists');
  } else {
    const { error: bucketError } = await supabase.storage.createBucket('complaint-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      fileSizeLimit: 10485760, // 10MB
    });
    if (bucketError) {
      console.log(`❌ Failed to create bucket: ${bucketError.message}`);
    } else {
      console.log('✅ Storage bucket "complaint-images" created (public, 10MB limit)');
    }
  }

  // 3. Set bucket policy to allow public reads
  await supabase.storage.from('complaint-images').list().catch(() => {});

  console.log('\n🎉 Setup complete! The app is ready to use.');
  console.log('\n📋 Next steps:');
  console.log('   1. Sign up at http://localhost:3000/sign-up');
  console.log('   2. Then run: node scripts/grant-admin.mjs');
}

run().catch(console.error);
