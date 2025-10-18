#!/bin/bash
# Script to sync Supabase credentials from dashboard to production

echo "🔄 Syncing Supabase credentials..."

# You'll need to update these when credentials change
# Get these from: https://app.supabase.com/project/fkzojsyipfhpimcwclhr/settings/api

SUPABASE_URL="https://fkzojsyipfhpimcwclhr.supabase.co"
SUPABASE_ANON_KEY="your-new-anon-key-here"

# For Vercel deployment
if command -v vercel &> /dev/null; then
    echo "📦 Updating Vercel environment variables..."
    vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
    echo "✅ Vercel environment updated"
fi

# For Netlify deployment  
if command -v netlify &> /dev/null; then
    echo "🌐 Updating Netlify environment variables..."
    netlify env:set NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
    netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY"
    echo "✅ Netlify environment updated"
fi

echo "🎉 Credential sync complete!"
echo "Remember to:"
echo "1. Update your local .env file"
echo "2. Redeploy your application"
echo "3. Test the authentication flow"