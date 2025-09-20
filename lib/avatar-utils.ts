/**
 * Utility functions for user avatar generation
 */

// Function to generate a consistent color based on user name/email
export function getAvatarColor(name?: string | null, email?: string | null): string {
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#10B981', // emerald-500
    '#8B5CF6', // violet-500
    '#F43F5E', // rose-500
    '#F59E0B', // amber-500
    '#84CC16', // lime-500
    '#0EA5E9', // sky-500
    '#D946EF'  // fuchsia-500
  ]
  
  const str = name || email || 'user'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Function to get user initials
export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const names = name.split(' ')
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }
    return names[0].charAt(0).toUpperCase()
  }
  
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  
  return 'U'
}