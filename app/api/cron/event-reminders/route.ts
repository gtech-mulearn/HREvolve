import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEventReminderEmails } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

// Event dates are stored as UTC midnight representing the intended calendar day
// (see the Event CMS date-handling convention). "Today" here is computed in IST
// so the window lines up with the actual calendar day for the app's audience,
// regardless of what UTC time the scheduled job happens to fire at.
function getTodayUtcRangeForIst() {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  const y = nowIst.getUTCFullYear()
  const m = nowIst.getUTCMonth()
  const d = nowIst.getUTCDate()
  const start = new Date(Date.UTC(y, m, d, 0, 0, 0))
  const end = new Date(Date.UTC(y, m, d + 1, 0, 0, 0))
  return { start, end }
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 })
  }

  const provided = request.headers.get('x-cron-secret')
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { start, end } = getTodayUtcRangeForIst()

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      reminderSentAt: null,
      date: { gte: start, lt: end },
    },
  })

  if (events.length === 0) {
    return NextResponse.json({ message: 'No events today without a reminder sent', events: [] })
  }

  const recipients = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { email: true },
  })
  const recipientEmails = recipients.map((u) => u.email).filter((e): e is string => !!e)

  const results = []

  for (const event of events) {
    const { sent, failed } = await sendEventReminderEmails(
      {
        title: event.title,
        dateLabel: event.date.toLocaleDateString('en-US', {
          timeZone: 'UTC',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: event.time,
        location: event.location,
        registrationUrl: event.registrationUrl,
      },
      recipientEmails
    )

    await prisma.event.update({
      where: { id: event.id },
      data: { reminderSentAt: new Date() },
    })

    results.push({ eventId: event.id, title: event.title, sent, failed })
  }

  return NextResponse.json({ message: 'Reminders processed', events: results })
}
