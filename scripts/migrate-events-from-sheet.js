// One-time script: migrate events from the legacy Google Sheet into the Event table.
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// NEXT_PUBLIC_GOOGLE_SHEET_ID lives in .env.local, which Prisma's automatic
// .env loading doesn't pick up outside the Next.js dev/build process - load it manually.
function loadEnvLocal() {
  const envLocalPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envLocalPath)) return
  const contents = fs.readFileSync(envLocalPath, 'utf8')
  for (const line of contents.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!match) continue
    const key = match[1]
    let value = (match[2] || '').trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (!(key in process.env)) process.env[key] = value
  }
}
loadEnvLocal()

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
const SHEETS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i += 2
        continue
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else if (char === '\r' && !inQuotes) {
      // skip
    } else if (char === '\n' && !inQuotes) {
      break
    } else {
      current += char
    }
    i++
  }
  result.push(current.trim())

  return result.map((field) => {
    field = field.trim()
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1).replace(/""/g, '"')
    }
    return field.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n+/g, ' ').trim()
  })
}

function parseCSVData(csvText) {
  const lines = []
  const rawLines = csvText.split('\n')
  let currentLine = ''

  for (const line of rawLines) {
    currentLine += (currentLine ? '\n' : '') + line
    const quoteCount = (currentLine.match(/"/g) || []).length
    if (quoteCount % 2 === 0) {
      lines.push(currentLine)
      currentLine = ''
    }
  }
  if (currentLine.trim()) lines.push(currentLine)

  return lines.map(parseCSVLine)
}

function convertGoogleDriveUrl(url) {
  if (!url || !url.includes('drive.google.com')) return url

  let fileId = ''
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileIdMatch) fileId = fileIdMatch[1]
  if (!fileId) {
    const altMatch = url.match(/id=([a-zA-Z0-9_-]+)/)
    if (altMatch) fileId = altMatch[1]
  }
  if (!fileId) return url

  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

async function main() {
  if (!SHEET_ID) {
    throw new Error('NEXT_PUBLIC_GOOGLE_SHEET_ID is not set')
  }

  console.log(`Fetching sheet data from ${SHEETS_CSV_URL}...`)
  const response = await fetch(SHEETS_CSV_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: HTTP ${response.status}`)
  }
  const csvText = await response.text()
  const rows = parseCSVData(csvText).slice(1) // skip header

  console.log(`Found ${rows.length} rows in the sheet.`)

  const prisma = new PrismaClient()
  let created = 0
  let skipped = 0

  try {
    for (const row of rows) {
      try {
        const title = (row[0] || '').trim()
        const date = (row[1] || '').trim()
        const time = (row[2] || '').trim()
        const description = (row[3] || '').trim()
        const image = convertGoogleDriveUrl((row[4] || '').trim())
        const linkedinUrl = (row[5] || '').trim()
        const location = (row[6] || '').trim()
        const category = (row[7] || '').trim()
        const registrationUrl = (row[9] || '').trim()

        if (!title || !date) {
          skipped++
          continue
        }

        await prisma.event.create({
          data: {
            title,
            description: description || null,
            image: image || null,
            date: new Date(date + 'T00:00:00'),
            time: time || null,
            location: location || null,
            category: category || null,
            linkedinUrl: linkedinUrl || null,
            registrationUrl: registrationUrl || null,
            isPublished: true,
          },
        })
        created++
        console.log(`Created: ${title}`)
      } catch (rowError) {
        console.error('Failed to migrate row:', row, rowError.message)
        skipped++
      }
    }
  } finally {
    await prisma.$disconnect()
  }

  console.log(`\nDone. Created ${created} events, skipped ${skipped} rows.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
