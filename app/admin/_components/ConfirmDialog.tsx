'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 animate-[fadeIn_0.15s_ease-out]"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              danger ? 'bg-red-100 dark:bg-red-500/10' : 'bg-amber-100 dark:bg-amber-500/10'
            }`}
          >
            <ExclamationTriangleIcon className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 disabled:opacity-50"
            style={{ borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-200 disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
