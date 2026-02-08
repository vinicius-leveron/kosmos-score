const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peegicizxybjgvuutegc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZWdpY2l6eHliamd2dXV0ZWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODQzOTAsImV4cCI6MjA4NjA2MDM5MH0.w8m6L7sCjI4ViLGB7fbqg-gEAR6sAVaTEAgepFLw548';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('1. Testing if user exists...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'vinicius@leveron.online',
    password: 'wrongpassword123'
  });
  
  console.log('Login result:', authError ? authError.message : 'Success!');
  
  console.log('\n2. Checking profiles table (anon)...');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id').limit(1);
  console.log('Profiles:', pErr ? pErr.message : 'OK - ' + (profiles ? profiles.length : 0) + ' rows');
  
  console.log('\n3. Checking org_members table (anon)...');
  const { data: members, error: mErr } = await supabase.from('org_members').select('profile_id').limit(1);
  console.log('Members:', mErr ? mErr.message : 'OK - ' + (members ? members.length : 0) + ' rows');
}

test().catch(e => console.error('Error:', e.message));
