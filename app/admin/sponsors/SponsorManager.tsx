'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOffice2Icon,
  TrashIcon,
  LinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import ConfirmDialog from '../_components/ConfirmDialog'
import EmptyState from '../_components/EmptyState'
import { useToast } from '../_components/Toast'

interface SponsorRow {
  id: string
  name: string | null
  logoUrl: string
  path: string
  websiteUrl: string | null
  createdAt: string
  months: { month: number; year: number }[]
}

interface QueueItem {
  id: string
  name: string
  status: 'uploading' | 'done' | 'error'
}

function currentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function SponsorManager({ sponsors }: { sponsors: SponsorRow[] }) {
  const router = useRouter()
  const { show } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth())
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SponsorRow | null>(null)

  const [year, month] = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    return [y, m]
  }, [selectedMonth])

  const isAssigned = (sponsor: SponsorRow) =>
    sponsor.months.some((a) => a.month === month && a.year === year)

  const isCurrentMonth = selectedMonth === currentYearMonth()

  const shiftMonth = (delta: number) => {
    setSelectedMonth((prev) => {
      const [y, m] = prev.split('-').map(Number)
      const date = new Date(y, m - 1 + delta, 1)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
  }

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

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('month', String(month))
      formData.append('year', String(year))

      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      const failedNames = new Set((data.failed || []).map((f: { filename: string }) => f.filename))
      setQueue(items.map((item) => (failedNames.has(item.name) ? { ...item, status: 'error' } : { ...item, status: 'done' })))

      const createdCount = data.created?.length || 0
      const failedCount = data.failed?.length || 0

      if (createdCount > 0) {
        show(`${createdCount} sponsor${createdCount === 1 ? '' : 's'} added for this month`)
        router.refresh()
      }
      if (failedCount > 0) {
        show(`${failedCount} logo${failedCount === 1 ? '' : 's'} failed to upload`, 'error')
      }
    } catch {
      setQueue(items.map((item) => ({ ...item, status: 'error' })))
      show('Upload failed', 'error')
    } finally {
      setTimeout(() => setQueue([]), 3000)
    }
  }

  const toggleAssigned = async (sponsor: SponsorRow) => {
    setBusyId(sponsor.id)
    try {
      const res = await fetch('/api/admin/sponsors/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorId: sponsor.id,
          month,
          year,
          assigned: !isAssigned(sponsor),
        }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      show('Failed to update sponsor', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const saveField = async (sponsor: SponsorRow, field: 'name' | 'websiteUrl', value: string) => {
    const trimmed = value.trim()
    const current = field === 'name' ? sponsor.name || '' : sponsor.websiteUrl || ''
    if (trimmed === current) return

    try {
      const res = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: trimmed }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      show('Failed to save changes', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    try {
      const res = await fetch(`/api/admin/sponsors/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      show('Sponsor deleted')
      router.refresh()
    } catch {
      show('Failed to delete sponsor', 'error')
    } finally {
      setBusyId(null)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Showing checklist for:
        </label>
        <div
          className="flex items-center gap-1 rounded-lg border p-1"
          style={{ borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <button
            onClick={() => shiftMonth(-1)}
            title="Previous month"
            className="p-1.5 rounded-md transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronLeftIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span
            className="px-2 text-sm font-semibold text-center select-none"
            style={{ color: 'var(--text-primary)', minWidth: '9.5rem' }}
          >
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={() => shiftMonth(1)}
            title="Next month"
            className="p-1.5 rounded-md transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={() => setSelectedMonth(currentYearMonth())}
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent-color)' }}
          >
            Today
          </button>
        )}
      </div>

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
        onClick={() => fileInputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-150 mb-4"
        style={{
          borderColor: dragging ? 'var(--accent-color)' : 'var(--border-custom)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <ArrowUpTrayIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Click or drag logos here to upload
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          New logos are added straight to the selected month &middot; PNG, JPG up to 5MB each
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
        <div className="mb-6 space-y-1.5">
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
              <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {sponsors.length === 0 ? (
        <EmptyState
          icon={<BuildingOffice2Icon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
          title="No sponsors yet"
          description="Upload your first sponsor logos to start building the monthly checklist."
        />
      ) : (
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
        >
          {sponsors.map((sponsor, i) => {
            const assigned = isAssigned(sponsor)
            return (
              <div
                key={sponsor.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5"
                style={i > 0 ? { borderTop: '1px solid var(--border-custom)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAssigned(sponsor)}
                    disabled={busyId === sponsor.id}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 disabled:opacity-50"
                    style={{
                      borderColor: assigned ? 'var(--accent-color)' : 'var(--border-custom)',
                      backgroundColor: assigned ? 'var(--accent-color)' : 'transparent',
                    }}
                    title={assigned ? 'Checked for this month' : 'Not included this month'}
                  >
                    {assigned && <CheckCircleIcon className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />}
                  </button>

                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name || ''}
                    className="w-12 h-12 rounded-lg object-contain flex-shrink-0 border"
                    style={{ borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-primary)' }}
                  />

                  <button
                    onClick={() => setDeleteTarget(sponsor)}
                    disabled={busyId === sponsor.id}
                    title="Delete sponsor"
                    className="sm:hidden ml-auto p-2 rounded-lg transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 flex-shrink-0"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="flex-grow min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    key={`${sponsor.id}-name`}
                    type="text"
                    defaultValue={sponsor.name || ''}
                    placeholder="Sponsor name"
                    onBlur={(e) => saveField(sponsor, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-sm bg-transparent"
                    style={{ borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
                  />
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                    <input
                      key={`${sponsor.id}-url`}
                      type="url"
                      defaultValue={sponsor.websiteUrl || ''}
                      placeholder="Website (optional)"
                      onBlur={(e) => saveField(sponsor, 'websiteUrl', e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-sm bg-transparent"
                      style={{ borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setDeleteTarget(sponsor)}
                  disabled={busyId === sponsor.id}
                  title="Delete sponsor"
                  className="hidden sm:inline-flex p-2 rounded-lg transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 flex-shrink-0"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete sponsor?"
        description={`"${deleteTarget?.name || 'This sponsor'}" will be permanently removed from every month's checklist. This can't be undone.`}
        confirmLabel="Delete"
        danger
        busy={busyId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
