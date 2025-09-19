// NextAuth type extensions
import 'next-auth'

declare global {
  interface Window {
    gsap: any;
    toggleMenu: () => void;
  }
}

// Application interfaces
export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  type: 'upcoming' | 'past';
}

// NextAuth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      userType?: 'MEMBER' | 'PARTNER'
      profileCompleted?: boolean
    }
  }

  interface User {
    role?: string
    userType?: 'MEMBER' | 'PARTNER'
    profileCompleted?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    userType?: 'MEMBER' | 'PARTNER'
  }
}

export {};