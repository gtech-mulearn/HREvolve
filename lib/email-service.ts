import nodemailer from 'nodemailer'

// Email service configuration
let transporter: nodemailer.Transporter | null = null

// Only create transporter if SMTP credentials are provided
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export interface EmailVerificationData {
  email: string
  name: string
  verificationUrl: string
}

export async function sendVerificationEmail({ email, name, verificationUrl }: EmailVerificationData) {
  // If no transporter configured, skip email sending
  if (!transporter) {
    console.log('SMTP not configured, skipping verification email')
    return false
  }
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your HR Evolve Account</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { 
          display: inline-block; 
          background: #000 !important; 
          color: white !important; 
          padding: 15px 40px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
        }
        .button:hover { background: #333 !important; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; }
        .link-box { 
          background: #eee; 
          padding: 15px; 
          border-radius: 5px; 
          word-break: break-all; 
          border: 1px solid #ddd;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 HR Evolve</h1>
        </div>
        <div class="content">
          <h2>Welcome to HR Evolve, ${name}!</h2>
          <p>Thank you for creating an account with HR Evolve. To complete your registration and activate your account, please verify your email address.</p>
          
          <p><strong>Click the button below to verify your email:</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button" style="background: #000 !important; color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              ✅ VERIFY NOW
            </a>
          </div>
          
          <p><strong>Or copy and paste this link in your browser:</strong></p>
          <div class="link-box">
            ${verificationUrl}
          </div>
          
          <p><strong>⏰ This verification link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with HR Evolve, please ignore this email.</p>
          
          <p>Best regards,<br>The HR Evolve Team</p>
        </div>
        <div class="footer">
          <p>© 2025 HR Evolve. All rights reserved.</p>
          <p>This is an automated email, please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    🚀 HR EVOLVE - VERIFY YOUR EMAIL
    
    Welcome to HR Evolve, ${name}!
    
    Thank you for creating an account with HR Evolve. To complete your registration and activate your account, please verify your email address.
    
    ✅ VERIFY NOW - Click this link: 
    ${verificationUrl}
    
    ⏰ This verification link will expire in 24 hours.
    
    If you didn't create an account with HR Evolve, please ignore this email.
    
    Best regards,
    The HR Evolve Team
    
    ---
    © 2025 HR Evolve. All rights reserved.
  `

  try {
    await transporter.sendMail({
      from: `"HR Evolve" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your HR Evolve Account',
      text: textContent,
      html: htmlContent,
    })
    
    console.log(`Verification email sent to: ${email}`)
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  // If no transporter configured, skip email sending
  if (!transporter) {
    console.log('SMTP not configured, skipping welcome email')
    return false
  }
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to HR Evolve!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to HR Evolve!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Your email has been successfully verified and your HR Evolve account is now active!</p>
          
          <p>You can now:</p>
          <ul>
            <li>Access your dashboard</li>
            <li>View upcoming events</li>
            <li>Update your profile</li>
            <li>Connect with the HR community</li>
          </ul>
          
          <p>Thank you for joining HR Evolve. We're excited to have you as part of our community!</p>
          
          <p>Best regards,<br>The HR Evolve Team</p>
        </div>
        <div class="footer">
          <p>© 2025 HR Evolve. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"HR Evolve" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to HR Evolve - Account Activated!',
      html: htmlContent,
    })
    
    console.log(`Welcome email sent to: ${email}`)
    return true
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}