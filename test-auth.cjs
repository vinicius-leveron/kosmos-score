const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peegicizxybjgvuutegc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZWdpY2l6eHliamd2dXV0ZWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODQzOTAsImV4cCI6MjA4NjA2MDM5MH0.w8m6L7sCjI4ViLGB7fbqg-gEAR6sAVaTEAgepFLw548';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing organizations (should work - public read)...');
  const start = Date.now();
  const { data: orgs, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(5);
  console.log('Organizations:', orgErr ? orgErr.message : orgs, '(' + (Date.now() - start) + 'ms)');
}

test().catch(e => console.error('Error:', e.message));
