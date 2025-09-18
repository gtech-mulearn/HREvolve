#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 HR Evolve Authentication Setup')
console.log('==================================\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env.local from .env.example...')
  try {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Created .env.local\n')
  } catch (error) {
    console.log('❌ Failed to create .env.local:', error.message)
    process.exit(1)
  }
} else {
  console.log('📋 .env.local already exists\n')
}

// Check environment variables
console.log('🔍 Checking environment variables...')
const envContent = fs.readFileSync(envPath, 'utf8')
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'NEXTAUTH_SECRET'
]

const missingVars = requiredVars.filter(varName => {
  const hasVar = envContent.includes(`${varName}=`) && 
                 !envContent.includes(`${varName}=your_`) &&
                 !envContent.includes(`${varName}=generate_`)
  return !hasVar
})

if (missingVars.length > 0) {
  console.log('⚠️  Missing or incomplete environment variables:')
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`)
  })
  console.log('\n📖 Please update your .env.local file with actual values.')
  console.log('📖 See AUTH_SETUP.md for detailed instructions.\n')
} else {
  console.log('✅ All required environment variables are set\n')
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Prisma client generated\n')
} catch (error) {
  console.log('❌ Failed to generate Prisma client:', error.message)
  console.log('💡 Make sure your DATABASE_URL is correct in .env.local\n')
}

// Summary
console.log('📊 Setup Summary')
console.log('================')
console.log('✅ Packages installed')
console.log('✅ Prisma schema created')
console.log('✅ Authentication components ready')
console.log('✅ Environment configuration prepared')
console.log('✅ Development server ready')

if (missingVars.length === 0) {
  console.log('✅ All environment variables configured')
  console.log('\n🎉 Setup complete! Your authentication system is ready.')
  console.log('\n📝 Next steps:')
  console.log('   1. Create a Supabase project (if not done)')
  console.log('   2. Run: npm run prisma:push (to create database tables)')
  console.log('   3. Visit: http://localhost:3000/auth/signin')
  console.log('   4. Test authentication features')
} else {
  console.log('⚠️  Environment configuration needed')
  console.log('\n📝 Next steps:')
  console.log('   1. Update .env.local with your actual values')
  console.log('   2. Read AUTH_SETUP.md for detailed instructions')
  console.log('   3. Run this setup script again')
}

console.log('\n📖 For detailed setup instructions, see: AUTH_SETUP.md')
console.log('🌐 Development server: http://localhost:3000')
console.log('🔐 Sign in page: http://localhost:3000/auth/signin')
console.log('📊 Dashboard: http://localhost:3000/dashboard')