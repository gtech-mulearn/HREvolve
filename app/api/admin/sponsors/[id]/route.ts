import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, SPONSOR_LOGOS_BUCKET } from '@/lib/supabase-admin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.sponsor.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
  }

  const body = await request.json()
  const { name, websiteUrl } = body

  const sponsor = await prisma.sponsor.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name || null }),
      ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
    },
  })

  return NextResponse.json({ sponsor })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.sponsor.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
  }

  await prisma.sponsor.delete({ where: { id: params.id } })

  try {
    await supabaseAdmin.storage.from(SPONSOR_LOGOS_BUCKET).remove([existing.path])
  } catch (cleanupError) {
    console.error('Failed to clean up sponsor logo from storage:', cleanupError)
  }

  return NextResponse.json({ message: 'Sponsor deleted' })
}
