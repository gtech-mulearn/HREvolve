import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Temporary endpoint to manually verify emails for testing
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Find and activate the user
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Activate the account manually
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        isActive: true,
      }
    })

    return NextResponse.json(
      { 
        message: 'Account manually verified and activated!',
        user: { name: user.name, email: user.email }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Manual verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}