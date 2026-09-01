import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const q = request.nextUrl.searchParams.get('q')?.trim()

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}
