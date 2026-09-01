import { ReactNode } from 'react'

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-12 text-center border shadow-sm flex flex-col items-center"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {action}
    </div>
  )
}
