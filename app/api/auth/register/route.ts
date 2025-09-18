import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'
import { normalizeEmail, isValidEmail, generateVerificationToken } from '../../../../lib/email-utils'
import { sendVerificationEmail } from '../../../../lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, department, position } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Normalize email to prevent duplicates
    const normalizedEmail = normalizeEmail(email)

    // Check if user already exists (by normalized email)
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email },
          { normalizedEmail: normalizedEmail }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if email verification is enabled (SMTP configured)
    const emailVerificationEnabled = process.env.SMTP_USER && process.env.SMTP_PASS

    let user;
    let requiresVerification = false;

    if (emailVerificationEnabled) {
      // Generate verification token
      const verificationToken = generateVerificationToken()
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create email verification record
      await prisma.emailVerification.create({
        data: {
          email: email,
          token: verificationToken,
          expires: verificationExpiry,
        }
      })

      // Create user in database (inactive until verified)
      user = await prisma.user.create({
        data: {
          name,
          email,
          normalizedEmail,
          password: hashedPassword,
          department,
          position,
          isActive: false, // Account is inactive until email is verified
        }
      })

      // Send verification email
      const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`
      
      try {
        await sendVerificationEmail({
          email: email,
          name: name,
          verificationUrl: verificationUrl,
        })
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Don't fail registration if email sending fails
      }

      requiresVerification = true
    } else {
      // Create user with immediate activation (no email verification)
      user = await prisma.user.create({
        data: {
          name,
          email,
          normalizedEmail,
          password: hashedPassword,
          department,
          position,
          isActive: true, // Account is immediately active
          emailVerified: new Date(), // Mark as verified
        }
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const message = emailVerificationEnabled 
      ? 'Account created successfully! Please check your email to verify your account.'
      : 'Account created successfully! You can now sign in.'

    return NextResponse.json(
      { 
        message,
        user: userWithoutPassword,
        requiresVerification
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}