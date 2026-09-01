const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  HOST: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  HR_MANAGER: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  USER: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
}

export default function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
        ROLE_STYLES[role] || ROLE_STYLES.USER
      }`}
    >
      {role.replace('_', ' ')}
    </span>
  )
}
