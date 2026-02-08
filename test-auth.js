const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peegicizxybjgvuutegc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZWdpY2l6eHliamd2dXV0ZWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MzQ4ODgsImV4cCI6MjA1NDUxMDg4OH0.yH8mGpdM3gYzJB3K1BFjlxs9Y2ORq-zB7Y8mLoYvbww';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('1. Testing login...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'vinicius@leveron.online',
    password: 'wrongpassword'
  });
  
  if (authError) {
    console.log('Auth error:', authError.message);
  } else {
    console.log('Logged in as:', authData.user.email);
  }
}

test().catch(e => console.error('Error:', e.message));
