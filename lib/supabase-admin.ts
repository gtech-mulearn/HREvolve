import { createClient } from '@supabase/supabase-js'

// Service-role client for server-only privileged operations (Storage uploads, etc).
// Never import this into a 'use client' file — the service role key bypasses RLS.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const EVENT_IMAGES_BUCKET = 'event-images'

export async function ensureEventImagesBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(EVENT_IMAGES_BUCKET, {
    public: true,
  })
  if (error && !error.message.includes('already exists')) {
    throw error
  }
}
