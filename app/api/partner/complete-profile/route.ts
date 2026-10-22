import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { PartnershipStatus } from '@prisma/client'
import { isValidCity } from '@/lib/cities'

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, userType: true, city: true, partner: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        city: user.city
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

    if (!data.companyName?.trim() || !data.businessType?.trim()) {
      return NextResponse.json({ error: 'Company name and business type are required' }, { status: 400 })
    }

    if (!isValidCity(data.city)) {
      return NextResponse.json({ error: 'Please select a valid location' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    // Mark the user as a partner and save the partner profile together, so a failed
    // profile save never leaves a user flagged PARTNER with no Partner row.
    const [, partner] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          userType: 'PARTNER',
          profileCompleted: true,
          city: data.city
        }
      }),
      prisma.partner.upsert({
        where: { userId: user.id },
        update: partnerData,
        create: { ...partnerData, userId: user.id }
      })
    ])

    return NextResponse.json({ 
      message: 'Partner profile saved successfully',
      partner 
    })
  } catch (error) {
    console.error('Failed to save partner profile:', error)
    return NextResponse.json({ error: 'Failed to save partner profile' }, { status: 500 })
  }
}