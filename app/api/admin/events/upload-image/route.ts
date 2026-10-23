import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, EVENT_IMAGES_BUCKET, ensureEventImagesBucket } from '@/lib/supabase-admin'
import { optimizeImage, buildStoragePath } from '@/lib/image-optimize'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 })
  }

  try {
    await ensureEventImagesBucket()

    const optimized = await optimizeImage(Buffer.from(await file.arrayBuffer()), file.type, 'event')
    const path = buildStoragePath('events', randomUUID(), file.name, optimized.ext)
    const buffer = optimized.buffer

    const { error: uploadError } = await supabaseAdmin.storage
      .from(EVENT_IMAGES_BUCKET)
      .upload(path, buffer, { contentType: optimized.contentType })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabaseAdmin.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl, path })
  } catch (uploadError) {
    console.error('Image upload failed:', uploadError)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
