import { getAvatarColor, getUserInitials } from '@/lib/avatar-utils'

export default function Avatar({ name, email, size = 40 }: { name?: string | null; email?: string | null; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: getAvatarColor(name, email),
      }}
    >
      {getUserInitials(name, email)}
    </div>
  )
}
