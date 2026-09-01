'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error'
}

interface ToastContextType {
  show: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-2xl border animate-[fadeIn_0.2s_ease-out]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
          >
            {toast.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {toast.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
