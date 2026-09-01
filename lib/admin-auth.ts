import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

type AdminRole = 'ADMIN' | 'HOST'

export async function requireAdminSession(allowedRoles: AdminRole[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { session: null, error: 'Unauthorized - please sign in', status: 401 as const }
  }

  const role = session.user.role
  if (!role || !allowedRoles.includes(role as AdminRole)) {
    return { session: null, error: 'Forbidden - insufficient permissions', status: 403 as const }
  }

  return { session, error: null, status: 200 as const }
}
