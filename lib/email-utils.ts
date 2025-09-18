/**
 * Email normalization and validation utilities
 */

export function normalizeEmail(email: string): string {
  if (!email) return email;
  
  const trimmedEmail = email.trim().toLowerCase();
  const [localPart, domain] = trimmedEmail.split('@');
  
  if (!localPart || !domain) return trimmedEmail;
  
  // Handle Gmail and Google Workspace domains
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove dots from Gmail local part
    const normalizedLocal = localPart.replace(/\./g, '');
    
    // Remove everything after '+' (Gmail aliases)
    const withoutAlias = normalizedLocal.split('+')[0];
    
    return `${withoutAlias}@gmail.com`;
  }
  
  // Handle other common providers that ignore dots
  const dotsIgnoredDomains = [
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com'
  ];
  
  if (dotsIgnoredDomains.includes(domain)) {
    const normalizedLocal = localPart.replace(/\./g, '');
    const withoutAlias = normalizedLocal.split('+')[0];
    return `${withoutAlias}@${domain}`;
  }
  
  // For other domains, just remove aliases but keep dots
  const withoutAlias = localPart.split('+')[0];
  return `${withoutAlias}@${domain}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}