// One-time script: recompress images already in Supabase Storage using the same
// presets as lib/image-optimize.ts (new uploads are optimised automatically).
//
// Usage (env from .env.local - note the CRLF line endings):
//   set -a; source <(tr -d '\r' < .env.local); set +a
//   node scripts/optimize-existing-images.js            # dry run: report only, writes nothing
//   node scripts/optimize-existing-images.js --apply    # upload .webp, update DB row, then delete old object
//
// --apply processes images one at a time. For each: upload optimised file to a new
// path, update the DB row, and only then remove the old object. Images that wouldn't
// shrink by at least 10% are skipped, so re-running is safe.

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')
const { randomUUID } = require('crypto')

const APPLY = process.argv.includes('--apply')
const MIN_SAVING = 0.1

// Keep in sync with lib/image-optimize.ts
const PRESETS = {
  photo: { width: 1920, height: 1920, quality: 78 },
  event: { width: 1600, height: 1600, quality: 78 },
  portrait: { width: 600, height: 600, quality: 80 },
  logo: { width: 600, height: 300, quality: 90 },
}

const prisma = new PrismaClient()
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Extract the object path from a Supabase public URL for the given bucket
function pathFromPublicUrl(url, bucket) {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

async function collectTargets() {
  const [gallery, events, team, sponsors] = await Promise.all([
    prisma.galleryImage.findMany({ select: { id: true, url: true, path: true } }),
    prisma.event.findMany({ where: { image: { not: null } }, select: { id: true, image: true } }),
    prisma.teamMember.findMany({ where: { imageUrl: { not: null } }, select: { id: true, imageUrl: true, path: true } }),
    prisma.sponsor.findMany({ select: { id: true, logoUrl: true, path: true } }),
  ])

  const targets = []
  for (const g of gallery) {
    targets.push({
      table: 'GalleryImage', id: g.id, bucket: 'gallery-images', preset: 'photo',
      path: g.path || pathFromPublicUrl(g.url, 'gallery-images'),
      update: (url, path) => prisma.galleryImage.update({ where: { id: g.id }, data: { url, path } }),
    })
  }
  for (const e of events) {
    targets.push({
      table: 'Event', id: e.id, bucket: 'event-images', preset: 'event',
      path: pathFromPublicUrl(e.image, 'event-images'), // null for Drive/other URLs -> skipped
      update: (url) => prisma.event.update({ where: { id: e.id }, data: { image: url } }),
    })
  }
  for (const t of team) {
    targets.push({
      table: 'TeamMember', id: t.id, bucket: 'team-photos', preset: 'portrait',
      path: t.path || pathFromPublicUrl(t.imageUrl, 'team-photos'),
      update: (url, path) => prisma.teamMember.update({ where: { id: t.id }, data: { imageUrl: url, path } }),
    })
  }
  for (const s of sponsors) {
    targets.push({
      table: 'Sponsor', id: s.id, bucket: 'sponsor-logos', preset: 'logo',
      path: s.path || pathFromPublicUrl(s.logoUrl, 'sponsor-logos'),
      update: (url, path) => prisma.sponsor.update({ where: { id: s.id }, data: { logoUrl: url, path } }),
    })
  }
  return targets
}

async function optimize(buffer, preset) {
  const { width, height, quality } = PRESETS[preset]
  const meta = await sharp(buffer, { failOn: 'none' }).metadata()
  if (meta.format === 'svg' || meta.format === 'gif') return null
  // Already WebP and within the size limits -> nothing to do (idempotent re-runs)
  if (meta.format === 'webp' && (meta.width || 0) <= width && (meta.height || 0) <= height) return null
  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer()
}

function newPathFor(oldPath) {
  const slash = oldPath.lastIndexOf('/')
  const folder = slash === -1 ? '' : oldPath.slice(0, slash + 1)
  const base = oldPath.slice(slash + 1).replace(/\.[^.]*$/, '').replace(/^[0-9a-f-]{36}-/i, '')
  return `${folder}${randomUUID()}-${base}.webp`
}

const kb = (n) => (n / 1024).toFixed(0)

async function main() {
  console.log(APPLY ? 'MODE: APPLY (will upload, update DB and delete old objects)\n' : 'MODE: DRY RUN (nothing is written)\n')

  const targets = await collectTargets()
  const totals = {}
  const rows = []

  for (const t of targets) {
    const bucketTotals = (totals[t.bucket] ||= { images: 0, before: 0, after: 0, changed: 0, skipped: 0 })

    if (!t.path) {
      bucketTotals.skipped++
      rows.push([t.bucket, t.id, '-', '-', 'skip: not in Supabase storage'])
      continue
    }

    const { data, error } = await supabase.storage.from(t.bucket).download(t.path)
    if (error || !data) {
      bucketTotals.skipped++
      rows.push([t.bucket, t.id, '-', '-', `skip: download failed (${error?.message || 'no data'})`])
      continue
    }

    const original = Buffer.from(await data.arrayBuffer())
    let optimized = null
    try {
      optimized = await optimize(original, t.preset)
    } catch (err) {
      rows.push([t.bucket, t.id, kb(original.length), '-', `skip: decode failed (${err.message})`])
      bucketTotals.skipped++
      continue
    }

    bucketTotals.images++
    bucketTotals.before += original.length

    if (!optimized || optimized.length > original.length * (1 - MIN_SAVING)) {
      bucketTotals.after += original.length
      rows.push([t.bucket, t.id, kb(original.length), kb(original.length), 'keep (already small)'])
      continue
    }

    bucketTotals.after += optimized.length
    bucketTotals.changed++
    rows.push([t.bucket, t.id, kb(original.length), kb(optimized.length), APPLY ? 'applying' : 'would optimise'])

    if (!APPLY) continue

    const newPath = newPathFor(t.path)
    const { error: uploadError } = await supabase.storage
      .from(t.bucket)
      .upload(newPath, optimized, { contentType: 'image/webp' })
    if (uploadError) {
      console.error(`  upload failed for ${t.table} ${t.id}: ${uploadError.message} - left unchanged`)
      continue
    }
    const { data: pub } = supabase.storage.from(t.bucket).getPublicUrl(newPath)

    try {
      await t.update(pub.publicUrl, newPath)
    } catch (err) {
      console.error(`  DB update failed for ${t.table} ${t.id}: ${err.message} - removing new object`)
      await supabase.storage.from(t.bucket).remove([newPath])
      continue
    }

    const { error: removeError } = await supabase.storage.from(t.bucket).remove([t.path])
    if (removeError) console.error(`  old object not removed for ${t.table} ${t.id}: ${removeError.message}`)
    console.log(`  done ${t.table} ${t.id} -> ${newPath}`)
  }

  console.log('\nbucket'.padEnd(17) + 'id'.padEnd(28) + 'before KB'.padStart(10) + 'after KB'.padStart(10) + '  result')
  for (const [bucket, id, before, after, result] of rows) {
    console.log(bucket.padEnd(16) + id.padEnd(28) + String(before).padStart(10) + String(after).padStart(10) + '  ' + result)
  }

  console.log('\nTotals')
  let allBefore = 0
  let allAfter = 0
  for (const [bucket, t] of Object.entries(totals)) {
    allBefore += t.before
    allAfter += t.after
    console.log(
      `  ${bucket.padEnd(16)} ${String(t.images).padStart(3)} images  ${(t.before / 1048576).toFixed(2)} MB -> ${(t.after / 1048576).toFixed(2)} MB  ` +
        `(${t.changed} ${APPLY ? 'optimised' : 'would change'}, ${t.skipped} skipped)`
    )
  }
  console.log(`  ${'ALL'.padEnd(16)}      ${(allBefore / 1048576).toFixed(2)} MB -> ${(allAfter / 1048576).toFixed(2)} MB`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
