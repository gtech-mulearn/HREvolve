// One-time script: create a credentials-login ADMIN account for initial CMS access.
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const EMAIL = 'admin@hrevolve.org'

async function main() {
  const password = crypto.randomBytes(12).toString('base64url')
  const hashedPassword = await bcrypt.hash(password, 12)

  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.upsert({
      where: { email: EMAIL },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        email: EMAIL,
        name: 'Bootstrap Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        profileCompleted: true,
        userType: 'MEMBER',
      },
    })

    console.log('\nBootstrap admin account ready:')
    console.log(`  Email:    ${user.email}`)
    console.log(`  Password: ${password}`)
    console.log('\nSign in at /auth/signin, promote your real account to ADMIN via /admin/users,')
    console.log('then delete this bootstrap account. This password is shown only once.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
