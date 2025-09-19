import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { PartnershipStatus } from '@prisma/client'

// Helper function to check if mandatory fields are completed
function checkMandatoryFields(partner: any): boolean {
  if (!partner) return false
  
  const mandatoryFields = [
    'companyName',
    'businessType', 
    'businessDescription',
    'contactPerson',
    'contactPhone',
    'servicesOffered',
    'partnershipGoals'
  ]
  
  return mandatoryFields.every(field => partner[field] && partner[field].trim() !== '')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Fetching partner profile for user:', session.user.email)

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        partner: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Found user with partner:', user)

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      },
      partner: user.partner,
      mandatoryFieldsComplete: checkMandatoryFields(user.partner)
    })
  } catch (error) {
    console.error('Failed to fetch partner profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const data = await request.json()

    console.log('Creating/updating partner profile for user:', session.user.email)
    console.log('Partner data:', data)

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        partner: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user type to PARTNER
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        userType: 'PARTNER',
        profileCompleted: true
      }
    })

    // Create or update partner profile
    const partnerData = {
      companyName: data.companyName,
      businessType: data.businessType,
      partnershipGoals: data.partnershipGoals || null,
      servicesOffered: data.servicesOffered || null,
      targetAudience: data.targetAudience || null,
      companySize: data.companySize || null,
      yearEstablished: data.yearEstablished || null,
      website: data.website || null,
      linkedinProfile: data.linkedinProfile || null,
      contactPerson: data.contactPerson || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      businessDescription: data.businessDescription || null,
      expectedBenefits: data.expectedBenefits || null,
      previousPartnerships: data.previousPartnerships || null,
      additionalInfo: data.additionalInfo || null,
      profileCompleted: true,
      partnershipStatus: PartnershipStatus.PENDING
    }

    let partner

    if (user.partner) {
      // Update existing partner profile
      partner = await prisma.partner.update({
        where: { userId: user.id },
        data: partnerData
      })
      console.log('Updated partner:', partner)
    } else {
      // Create new partner profile
      partner = await prisma.partner.create({
        data: {
          ...partnerData,
          userId: user.id
        }
      })
      console.log('Created partner:', partner)
    }

    return NextResponse.json({ 
      message: 'Partner profile saved successfully',
      partner 
    })
  } catch (error) {
    console.error('Failed to save partner profile:', error)
    return NextResponse.json({ error: 'Failed to save partner profile' }, { status: 500 })
  }
}