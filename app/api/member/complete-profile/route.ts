import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      phone,
      organization,
      designation,
      experience,
      linkedinUrl,
      expertise,
      interests
    } = body

    // Validate required fields
    if (!name || !phone || !organization || !designation || !experience) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (name, phone, organization, designation, experience)' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      )
    }

    // Validate LinkedIn URL if provided
    if (linkedinUrl && !linkedinUrl.includes('linkedin.com')) {
      return NextResponse.json(
        { error: 'Please enter a valid LinkedIn profile URL' },
        { status: 400 }
      )
    }

    try {
      // Update user profile in database
      console.log('Updating user with email:', session.user.email) // Debug log
      console.log('Update data:', {
        name,
        phone,
        organization,
        designation,
        experience,
        linkedinUrl: linkedinUrl || null,
        expertise: expertise || null,
        interests: interests || null,
        profileCompleted: true
      }) // Debug log

      // Update user profile
      const updateData: any = {
        name,
        phone,
        organization,
        designation,
        experience,
        linkedinUrl: linkedinUrl || null,
        expertise: expertise || null,
        interests: interests || null,
        profileCompleted: true,
        updatedAt: new Date()
      }

      const updatedUser = await prisma.user.update({
        where: {
          email: session.user.email
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          organization: true,
          designation: true,
          experience: true,
          linkedinUrl: true,
          expertise: true,
          interests: true,
          profileCompleted: true,
          userType: true,
          createdAt: true,
          updatedAt: true
        }
      })

      console.log('Updated user:', updatedUser) // Debug log

      return NextResponse.json({
        message: 'Profile completed successfully!',
        user: updatedUser
      }, { status: 200 })

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save profile information. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET method to retrieve current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching profile for user:', session.user.email) // Debug log

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        designation: true,
        experience: true,
        linkedinUrl: true,
        expertise: true,
        interests: true,
        profileCompleted: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('Found user:', user) // Debug log

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}