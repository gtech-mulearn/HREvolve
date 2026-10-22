import { randomUUID } from 'crypto'
import { supabaseAdmin, TEAM_PHOTOS_BUCKET, ensureTeamPhotosBucket } from '@/lib/supabase-admin'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

// Validates and uploads a team member photo. Returns the public URL and storage path,
// or an error message suitable for the client.
export async function uploadTeamPhoto(file: File) {
  if (!file.type.startsWith('image/')) {
    return { error: 'Photo must be an image' }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: 'Photo must be 5MB or smaller' }
  }

  await ensureTeamPhotosBucket()

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `team/${randomUUID()}-${sanitizedName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from(TEAM_PHOTOS_BUCKET)
    .upload(path, buffer, { contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabaseAdmin.storage.from(TEAM_PHOTOS_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export function isValidLinkedinUrl(url: string) {
  return /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\//i.test(url)
}

export async function removeTeamPhoto(path: string | null) {
  if (!path) return
  try {
    await supabaseAdmin.storage.from(TEAM_PHOTOS_BUCKET).remove([path])
  } catch (cleanupError) {
    console.error('Failed to clean up team photo from storage:', cleanupError)
  }
}
