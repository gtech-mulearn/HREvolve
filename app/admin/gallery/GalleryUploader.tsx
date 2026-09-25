'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpTrayIcon, CheckCircleIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useToast } from '../_components/Toast'

interface QueueItem {
  id: string
  name: string
  status: 'uploading' | 'done' | 'error'
  error?: string
}

export default function GalleryUploader({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()
  const { show } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [busy, setBusy] = useState(false)

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) {
      show('Please choose image files', 'error')
      return
    }

    const items: QueueItem[] = files.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      status: 'uploading',
    }))
    setQueue(items)
    setBusy(true)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      const failedNames = new Set((data.failed || []).map((f: { filename: string }) => f.filename))
      setQueue(
        items.map((item) =>
          failedNames.has(item.name) ? { ...item, status: 'error', error: 'Failed' } : { ...item, status: 'done' }
        )
      )

      const createdCount = data.created?.length || 0
      const failedCount = data.failed?.length || 0

      if (createdCount > 0) {
        show(
          isAdmin
            ? `${createdCount} photo${createdCount === 1 ? '' : 's'} uploaded`
            : `${createdCount} photo${createdCount === 1 ? '' : 's'} uploaded, pending approval`
        )
        router.refresh()
      }
      if (failedCount > 0) {
        show(`${failedCount} photo${failedCount === 1 ? '' : 's'} failed to upload`, 'error')
      }
    } catch (err) {
      setQueue(items.map((item) => ({ ...item, status: 'error', error: 'Failed' })))
      show('Upload failed', 'error')
    } finally {
      setBusy(false)
      setTimeout(() => setQueue([]), 3000)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !busy && fileInputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-150"
        style={{
          borderColor: dragging ? 'var(--accent-color)' : 'var(--border-custom)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <ArrowUpTrayIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Click or drag photos here to upload
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          PNG, JPG up to 5MB each &middot; multiple files supported
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {queue.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
            >
              {item.status === 'uploading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 flex-shrink-0" style={{ borderColor: 'var(--text-secondary)' }} />
              )}
              {item.status === 'done' && <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              {item.status === 'error' && <XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />}
              <PhotoIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
