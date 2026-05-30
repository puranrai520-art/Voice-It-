-- ============================================================
-- VoiceIt Full Database Setup (v3)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run — all statements are idempotent
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  user_type TEXT DEFAULT 'student' CHECK (user_type IN ('student', 'staff')),
  email_notifications BOOLEAN DEFAULT true,
  student_details JSONB DEFAULT NULL,
  teacher_details JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe column additions (re-run safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='student_details'
  ) THEN
    ALTER TABLE users ADD COLUMN student_details JSONB DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='teacher_details'
  ) THEN
    ALTER TABLE users ADD COLUMN teacher_details JSONB DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='user_type'
  ) THEN
    ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'student' CHECK (user_type IN ('student', 'staff'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='email_notifications'
  ) THEN
    ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT true;
  END IF;
END $$;

-- =====================
-- COMPLAINTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other')),
  complaint_type TEXT DEFAULT 'student' CHECK (complaint_type IN ('student', 'staff')),
  image_url TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Review', 'Resolved')),
  priority INTEGER CHECK (priority BETWEEN 1 AND 5),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  ai_reply TEXT,
  admin_reply TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe column additions for complaints (re-run safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='complaints' AND column_name='rating'
  ) THEN
    ALTER TABLE complaints ADD COLUMN rating INTEGER CHECK (rating BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='complaints' AND column_name='complaint_type'
  ) THEN
    ALTER TABLE complaints ADD COLUMN complaint_type TEXT DEFAULT 'student' CHECK (complaint_type IN ('student', 'staff'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='complaints' AND column_name='image_url'
  ) THEN
    ALTER TABLE complaints ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='complaints' AND column_name='ai_reply'
  ) THEN
    ALTER TABLE complaints ADD COLUMN ai_reply TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='complaints' AND column_name='admin_reply'
  ) THEN
    ALTER TABLE complaints ADD COLUMN admin_reply TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='complaints' AND column_name='is_read'
  ) THEN
    ALTER TABLE complaints ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =====================
-- COMPLAINT COMMENTS TABLE
-- Stores per-complaint stage notes / solution steps
-- =====================
CREATE TABLE IF NOT EXISTS complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  stage_label TEXT,          -- e.g. "Investigation", "Escalated", "Resolved"
  message TEXT NOT NULL,
  is_admin_note BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS complaints_user_id_idx           ON complaints(user_id);
CREATE INDEX IF NOT EXISTS complaints_status_idx            ON complaints(status);
CREATE INDEX IF NOT EXISTS complaints_complaint_type_idx    ON complaints(complaint_type);
CREATE INDEX IF NOT EXISTS complaints_created_at_idx        ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS users_clerk_id_idx               ON users(clerk_id);
CREATE INDEX IF NOT EXISTS users_email_idx                  ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx                   ON users(role);
CREATE INDEX IF NOT EXISTS users_user_type_idx              ON users(user_type);
CREATE INDEX IF NOT EXISTS complaint_comments_complaint_idx ON complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS complaint_comments_created_idx   ON complaint_comments(created_at);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Service role full access" ON complaints;
DROP POLICY IF EXISTS "Service role full access" ON complaint_comments;

-- Service role bypasses RLS (used by our server actions via SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (true);

CREATE POLICY "Service role full access" ON complaints
  FOR ALL USING (true);

CREATE POLICY "Service role full access" ON complaint_comments
  FOR ALL USING (true);

-- =====================
-- STORAGE BUCKETS
-- Create buckets if they don't exist, ensure public access
-- =====================

-- Complaint images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-images',
  'complaint-images',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/jpg']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/jpg'];

-- Profile images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,   -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/jpg']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/jpg'];

-- =====================
-- STORAGE POLICIES — Drop all existing, recreate cleanly
-- =====================

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can upload complaint images"  ON storage.objects;
DROP POLICY IF EXISTS "Public read complaint images"                     ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own complaint images"            ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images"    ON storage.objects;
DROP POLICY IF EXISTS "Public read profile images"                       ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images"              ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile images"                  ON storage.objects;
DROP POLICY IF EXISTS "Allow all on complaint-images"                    ON storage.objects;
DROP POLICY IF EXISTS "Allow all on profile-images"                      ON storage.objects;

-- Complaint-images: full permissive access (service role bypasses anyway)
CREATE POLICY "Allow all on complaint-images"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'complaint-images')
  WITH CHECK (bucket_id = 'complaint-images');

-- Profile-images: full permissive access
CREATE POLICY "Allow all on profile-images"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'profile-images')
  WITH CHECK (bucket_id = 'profile-images');
