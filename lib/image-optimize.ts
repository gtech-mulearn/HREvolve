import sharp from 'sharp'

// Resize + re-encode uploads before they go to Supabase Storage, so the site never
// serves multi-megabyte camera originals. Server-only.

const PRESETS = {
  // Gallery photos are also shown full-screen in the lightbox
  photo: { width: 1920, height: 1920, quality: 78 },
  event: { width: 1600, height: 1600, quality: 78 },
  portrait: { width: 600, height: 600, quality: 80 },
  // Logos keep transparency; higher quality so text stays crisp
  logo: { width: 600, height: 300, quality: 90 },
} as const

export type ImagePreset = keyof typeof PRESETS

// Formats sharp shouldn't touch (vector / animated)
const PASSTHROUGH_TYPES = new Set(['image/svg+xml', 'image/gif'])

export async function optimizeImage(input: Buffer, contentType: string, preset: ImagePreset) {
  if (PASSTHROUGH_TYPES.has(contentType)) {
    return { buffer: input, contentType, ext: null as string | null }
  }

  const { width, height, quality } = PRESETS[preset]

  try {
    const output = await sharp(input, { failOn: 'none' })
      .rotate() // apply EXIF orientation before metadata is stripped
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer()

    // Already-small images can come out larger after re-encoding; keep the original then
    if (output.length >= input.length) {
      return { buffer: input, contentType, ext: null }
    }
    return { buffer: output, contentType: 'image/webp', ext: 'webp' }
  } catch (error) {
    console.error('Image optimization failed, uploading original:', error)
    return { buffer: input, contentType, ext: null }
  }
}

// `<prefix>/<uuid>-<sanitized name>`, with the extension swapped when the image was re-encoded
export function buildStoragePath(prefix: string, uuid: string, originalName: string, ext: string | null) {
  const sanitized = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const name = ext ? sanitized.replace(/\.[^.]*$/, '') + `.${ext}` : sanitized
  return `${prefix}/${uuid}-${name}`
}
