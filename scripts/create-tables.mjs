// Creates all VoiceIt database tables + storage bucket directly via Postgres
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.yntbsfhgtdpmvwdfxwli.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'NC$y5e@3K79HX.W',
  ssl: { rejectUnauthorized: false },
});

async function createTables() {
  console.log('🔌 Connecting to Supabase Postgres...');
  await client.connect();
  console.log('✅ Connected!\n');

  const statements = [
    {
      name: 'uuid-ossp extension',
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    },
    {
      name: 'users table',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clerk_id TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          name TEXT,
          avatar_url TEXT,
          role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
          email_notifications BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
    },
    {
      name: 'complaints table',
      sql: `
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
        );`
    },
    {
      name: 'index: complaints_user_id_idx',
      sql: `CREATE INDEX IF NOT EXISTS complaints_user_id_idx ON complaints(user_id);`
    },
    {
      name: 'index: complaints_status_idx',
      sql: `CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);`
    },
    {
      name: 'index: complaints_created_at_idx',
      sql: `CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON complaints(created_at DESC);`
    },
    {
      name: 'index: users_clerk_id_idx',
      sql: `CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id);`
    },
    {
      name: 'index: users_email_idx',
      sql: `CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`
    },
    {
      name: 'RLS on users',
      sql: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'RLS on complaints',
      sql: `ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'RLS policy: users',
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role full access'
          ) THEN
            CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
          END IF;
        END $$;`
    },
    {
      name: 'RLS policy: complaints',
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'Service role full access'
          ) THEN
            CREATE POLICY "Service role full access" ON complaints FOR ALL USING (true);
          END IF;
        END $$;`
    },
    {
      name: 'storage bucket: complaint-images',
      sql: `
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'complaint-images',
          'complaint-images',
          true,
          10485760,
          ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif']
        )
        ON CONFLICT (id) DO UPDATE SET public = true;`
    },
    {
      name: 'storage policy: public read',
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public read complaint-images'
          ) THEN
            CREATE POLICY "Public read complaint-images" ON storage.objects
              FOR SELECT USING (bucket_id = 'complaint-images');
          END IF;
        END $$;`
    },
    {
      name: 'storage policy: authenticated upload',
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth upload complaint-images'
          ) THEN
            CREATE POLICY "Auth upload complaint-images" ON storage.objects
              FOR INSERT WITH CHECK (bucket_id = 'complaint-images');
          END IF;
        END $$;`
    },
    {
      name: 'storage policy: delete own files',
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Delete complaint-images'
          ) THEN
            CREATE POLICY "Delete complaint-images" ON storage.objects
              FOR DELETE USING (bucket_id = 'complaint-images');
          END IF;
        END $$;`
    },
  ];

  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      await client.query(stmt.sql);
      console.log(`  ✅ ${stmt.name}`);
      success++;
    } catch (err) {
      console.log(`  ❌ ${stmt.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Result: ${success} succeeded, ${failed} failed`);

  // Verify tables exist
  console.log('\n🔍 Verifying tables...');
  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('users','complaints')
    ORDER BY table_name;
  `);
  if (rows.length === 2) {
    console.log('  ✅ users table — OK');
    console.log('  ✅ complaints table — OK');
    console.log('\n🎉 Database is fully set up and ready!');
    console.log('\n👉 Now sign up at http://localhost:3000/sign-up');
    console.log('   First user (puranrai520@gmail.com) will automatically become admin.');
  } else {
    console.log(`  ⚠️  Only found: ${rows.map(r => r.table_name).join(', ') || 'none'}`);
  }

  await client.end();
}

createTables().catch(async (err) => {
  console.error('❌ Fatal error:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
