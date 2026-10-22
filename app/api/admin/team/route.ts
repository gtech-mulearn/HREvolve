import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { isValidCity } from '@/lib/cities'
import { uploadTeamPhoto, isValidLinkedinUrl } from '@/lib/team'

export async function GET(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const cityParam = request.nextUrl.searchParams.get('city')

  const members = await prisma.teamMember.findMany({
    where: isValidCity(cityParam) ? { city: cityParam } : undefined,
    orderBy: [{ city: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({ members })
}

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const formData = await request.formData()
  const name = String(formData.get('name') || '').trim()
  const role = String(formData.get('role') || '').trim()
  const linkedinUrl = String(formData.get('linkedinUrl') || '').trim()
  const city = formData.get('city')
  const order = parseInt(String(formData.get('order') || '0'), 10) || 0
  const photo = formData.get('photo')

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!isValidCity(city)) {
    return NextResponse.json({ error: 'A valid city is required' }, { status: 400 })
  }
  if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
    return NextResponse.json({ error: 'Please enter a valid LinkedIn URL' }, { status: 400 })
  }

  let imageUrl: string | null = null
  let path: string | null = null

  if (photo instanceof File && photo.size > 0) {
    try {
      const result = await uploadTeamPhoto(photo)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      imageUrl = result.url!
      path = result.path!
    } catch (uploadError) {
      console.error('Team photo upload failed:', uploadError)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }
  }

  const member = await prisma.teamMember.create({
    data: {
      name,
      role: role || null,
      linkedinUrl: linkedinUrl || null,
      city,
      order,
      imageUrl,
      path,
      createdById: session.user.id,
    },
  })

  return NextResponse.json({ member }, { status: 201 })
}
