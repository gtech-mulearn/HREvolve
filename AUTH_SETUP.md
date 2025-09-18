# Authentication Setup Guide

This guide will help you set up Supabase, PostgreSQL, Prisma, and authentication (Google + Email) for your HR Evolve website.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. A Google Cloud Console project for OAuth (https://console.cloud.google.com)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Once created, go to Settings > API
3. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Update `.env.local` with your actual values:
   ```env
   # Your existing Google Sheets ID (keep this)
   NEXT_PUBLIC_GOOGLE_SHEET_ID=your_actual_sheet_id

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Database Configuration (from Supabase)
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_a_random_string_here

   # Google OAuth (optional - for Google Sign-in)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. To get your database URL:
   - In Supabase, go to Settings > Database
   - Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

## Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Or use an online generator and paste it as `NEXTAUTH_SECRET`.

## Step 4: Set Up Google OAuth (Optional)

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy Client ID and Client Secret to your `.env.local`

## Step 5: Initialize Database

Run the following commands to set up your database:

```bash
# Generate Prisma client
npm run prisma:generate

# Push the schema to your database
npm run prisma:push

# (Optional) Open Prisma Studio to view your data
npm run prisma:studio
```

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try signing up with email or Google
4. Check your Supabase dashboard to see if users are being created

## Available Scripts

We've added these scripts to your `package.json`:

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Create and run migrations

## Features Added

1. **User Authentication**:
   - Email/password registration and login
   - Google OAuth login
   - User sessions with NextAuth.js

2. **User Management**:
   - User profiles with name, email, department, position
   - Role-based access (USER, ADMIN, HR_MANAGER)
   - Secure password hashing

3. **Database Models**:
   - Users with authentication data
   - Events management
   - Contact form submissions
   - Session management

4. **UI Components**:
   - Sign in/Sign up pages
   - User button in navigation
   - Responsive authentication forms

## Auth Pages

- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

## API Routes

- `/api/auth/*` - NextAuth.js authentication endpoints
- `/api/auth/register` - User registration endpoint

## Security Features

- Password hashing with bcrypt
- JWT session tokens
- CSRF protection
- Secure cookie handling
- Environment variable protection

## Troubleshooting

1. **Database connection issues**: Check your DATABASE_URL format
2. **Google OAuth not working**: Verify redirect URIs match exactly
3. **NextAuth errors**: Ensure NEXTAUTH_SECRET is set and NEXTAUTH_URL matches your domain
4. **Prisma errors**: Run `npm run prisma:generate` after schema changes

## Next Steps

1. Customize user roles and permissions
2. Add email verification
3. Implement password reset functionality
4. Add user profile management pages
5. Set up admin dashboard for user management

Need help? Check the Supabase docs (https://supabase.com/docs) or NextAuth.js docs (https://next-auth.js.org/).