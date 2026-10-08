import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, SPONSOR_LOGOS_BUCKET, ensureSponsorLogosBucket } from '@/lib/supabase-admin'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export async function GET() {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const sponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: 'desc' },
    include: { months: true },
  })

  return NextResponse.json({ sponsors })
}

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const formData = await request.formData()
  const files = formData.getAll('files')
  const month = parseInt(String(formData.get('month')), 10)
  const year = parseInt(String(formData.get('year')), 10)

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }
  if (!month || month < 1 || month > 12 || !year) {
    return NextResponse.json({ error: 'A valid month and year are required' }, { status: 400 })
  }

  try {
    await ensureSponsorLogosBucket()
  } catch (bucketError) {
    console.error('Failed to ensure sponsor logos bucket:', bucketError)
    return NextResponse.json({ error: 'Failed to prepare storage' }, { status: 500 })
  }

  const created: { id: string; name: string | null; logoUrl: string }[] = []
  const failed: { filename: string; error: string }[] = []

  for (const entry of files) {
    if (!(entry instanceof File)) continue

    if (!entry.type.startsWith('image/')) {
      failed.push({ filename: entry.name, error: 'File must be an image' })
      continue
    }
    if (entry.size > MAX_SIZE_BYTES) {
      failed.push({ filename: entry.name, error: 'Image must be 5MB or smaller' })
      continue
    }

    try {
      const sanitizedName = entry.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const path = `sponsors/${randomUUID()}-${sanitizedName}`
      const buffer = Buffer.from(await entry.arrayBuffer())

      const { error: uploadError } = await supabaseAdmin.storage
        .from(SPONSOR_LOGOS_BUCKET)
        .upload(path, buffer, { contentType: entry.type })

      if (uploadError) throw uploadError

      const { data } = supabaseAdmin.storage.from(SPONSOR_LOGOS_BUCKET).getPublicUrl(path)

      const defaultName = entry.name.replace(/\.[^/.]+$/, '')

      const sponsor = await prisma.sponsor.create({
        data: {
          name: defaultName || null,
          logoUrl: data.publicUrl,
          path,
          createdById: session.user.id,
          months: {
            create: { month, year },
          },
        },
      })

      created.push({ id: sponsor.id, name: sponsor.name, logoUrl: sponsor.logoUrl })
    } catch (uploadError) {
      console.error('Sponsor logo upload failed:', uploadError)
      failed.push({ filename: entry.name, error: 'Upload failed' })
    }
  }

  return NextResponse.json({ created, failed }, { status: created.length > 0 ? 201 : 400 })
}
