import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendWelcomeEmail } from '../../../../lib/email-service'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token }
    })

    if (!verification) {
      return NextResponse.json(
        { 
          message: 'This verification link has already been used or is invalid. If you have an account, you can sign in directly.',
          alreadyVerified: true,
          verified: true
        },
        { status: 200 }
      )
    }

    // Check if token has expired
    if (verification.expires < new Date()) {
      // Clean up expired token
      try {
        await prisma.emailVerification.delete({
          where: { token }
        })
      } catch (deleteError) {
        console.error('Failed to delete expired token:', deleteError)
      }
      
      return NextResponse.json(
        { message: 'Verification token has expired. Please register again.' },
        { status: 400 }
      )
    }

    // Find the user and verify their email
    const user = await prisma.user.findUnique({
      where: { email: verification.email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 400 }
      )
    }

    // Check if user is already verified
    if (user.isActive && user.emailVerified) {
      // Clean up the token since user is already verified
      try {
        await prisma.emailVerification.delete({
          where: { token }
        })
      } catch (deleteError) {
        console.error('Failed to delete token for already verified user:', deleteError)
      }
      
      return NextResponse.json(
        { 
          message: 'Email already verified! Your account is active.',
          verified: true,
          alreadyVerified: true
        },
        { status: 200 }
      )
    }

    try {
      // Update user to verified and active
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          isActive: true,
        }
      })

      // Clean up verification token
      await prisma.emailVerification.delete({
        where: { token }
      })

      // Send welcome email (don't fail if this doesn't work)
      try {
        await sendWelcomeEmail(user.email!, user.name!)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail verification if welcome email fails
      }

      return NextResponse.json(
        { 
          message: 'Email verified successfully! Your account is now active.',
          verified: true
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('Database error during verification:', dbError)
      return NextResponse.json(
        { message: 'Failed to verify account. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}