// Keep Supabase project alive by making periodic requests
// Run this as a cron job or GitHub Action

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function keepAlive() {
  try {
    // Make a simple query to keep the database active
    const { data, error } = await supabase
      .from('User')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('Keep-alive query error:', error.message)
    } else {
      console.log('Keep-alive successful:', new Date().toISOString())
    }
  } catch (error) {
    console.log('Keep-alive failed:', error.message)
  }
}

keepAlive()