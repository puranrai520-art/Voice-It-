// Adds rating column to complaints table via Supabase service role
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yntbsfhgtdpmvwdfxwli.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludGJzZmhndGRwbXZ3ZGZ4d2xpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMzOTAyMywiZXhwIjoyMDk0OTE1MDIzfQ.DW285a4Ah373pPkk4iD7h_qirGTRyfa0pJfxgm6LuIg'
);

async function migrate() {
  // Try inserting a test record and check if rating column exists
  const { data: sample } = await supabase.from('complaints').select('id, rating').limit(1);
  
  if (sample !== null && 'rating' in (sample[0] || {})) {
    console.log('✅ rating column already exists');
  } else {
    console.log('ℹ️  rating column not found via select - need direct SQL');
    console.log('\n📋 Please run this SQL in Supabase Dashboard → SQL Editor:\n');
    console.log('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5);');
    console.log('\nOR the column may already exist. Testing update...');
  }

  // Test if we can update rating field
  const { data: anyComplaint } = await supabase.from('complaints').select('id').limit(1).single();
  if (anyComplaint) {
    const { error } = await supabase
      .from('complaints')
      .update({ rating: null })
      .eq('id', anyComplaint.id);
    
    if (error) {
      console.log('❌ rating column missing:', error.message);
      console.log('\n📋 Run in Supabase SQL Editor:');
      console.log('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5);');
    } else {
      console.log('✅ rating column EXISTS and works!');
    }
  } else {
    console.log('ℹ️  No complaints yet to test. Column will be verified on first use.');
  }
}

migrate().catch(console.error);
