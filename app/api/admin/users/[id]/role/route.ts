import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'

const VALID_ROLES = ['USER', 'ADMIN', 'HOST', 'HR_MANAGER']

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const { role } = await request.json()

  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  if (params.id === session.user.id && role !== 'ADMIN') {
    return NextResponse.json(
      { error: "You can't demote your own account" },
      { status: 400 }
    )
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ user })
}
