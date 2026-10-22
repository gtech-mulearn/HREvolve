import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { isValidCity } from '@/lib/cities'
import { uploadTeamPhoto, removeTeamPhoto, isValidLinkedinUrl } from '@/lib/team'

// Accepts multipart form data so the photo can be replaced in the same request.
// Only fields present in the form are updated.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.teamMember.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  }

  const formData = await request.formData()
  const data: Record<string, unknown> = {}

  if (formData.has('name')) {
    const name = String(formData.get('name')).trim()
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    data.name = name
  }
  if (formData.has('role')) {
    data.role = String(formData.get('role')).trim() || null
  }
  if (formData.has('linkedinUrl')) {
    const linkedinUrl = String(formData.get('linkedinUrl')).trim()
    if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'Please enter a valid LinkedIn URL' }, { status: 400 })
    }
    data.linkedinUrl = linkedinUrl || null
  }
  if (formData.has('city')) {
    const city = formData.get('city')
    if (!isValidCity(city)) {
      return NextResponse.json({ error: 'A valid city is required' }, { status: 400 })
    }
    data.city = city
  }
  if (formData.has('order')) {
    data.order = parseInt(String(formData.get('order')), 10) || 0
  }

  const photo = formData.get('photo')
  if (photo instanceof File && photo.size > 0) {
    try {
      const result = await uploadTeamPhoto(photo)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      data.imageUrl = result.url
      data.path = result.path
    } catch (uploadError) {
      console.error('Team photo upload failed:', uploadError)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }
  }

  const member = await prisma.teamMember.update({ where: { id: params.id }, data })

  if (data.path) {
    await removeTeamPhoto(existing.path)
  }

  return NextResponse.json({ member })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.teamMember.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  }

  await prisma.teamMember.delete({ where: { id: params.id } })
  await removeTeamPhoto(existing.path)

  return NextResponse.json({ message: 'Team member deleted' })
}
