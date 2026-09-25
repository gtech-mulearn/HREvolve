'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckIcon,
  TrashIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import StatusBadge from '../_components/StatusBadge'
import ConfirmDialog from '../_components/ConfirmDialog'
import EmptyState from '../_components/EmptyState'
import { useToast } from '../_components/Toast'

interface GalleryImageRow {
  id: string
  url: string
  caption: string | null
  isPublished: boolean
  createdAt: string
  createdBy: { name: string | null; email: string | null } | null
}

type Tab = 'all' | 'pending' | 'published'

export default function GalleryGrid({ isAdmin, images }: { isAdmin: boolean; images: GalleryImageRow[] }) {
  const router = useRouter()
  const { show } = useToast()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'all'

  const [tab, setTab] = useState<Tab>(initialTab)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImageRow | null>(null)
  const [bulkAction, setBulkAction] = useState<'approve' | 'delete' | null>(null)

  const counts = useMemo(
    () => ({
      all: images.length,
      pending: images.filter((i) => !i.isPublished).length,
      published: images.filter((i) => i.isPublished).length,
    }),
    [images]
  )

  const filtered = useMemo(() => {
    if (tab === 'pending') return images.filter((i) => !i.isPublished)
    if (tab === 'published') return images.filter((i) => i.isPublished)
    return images
  }, [images, tab])

  const hasPendingSelected = useMemo(
    () => filtered.some((image) => selected.has(image.id) && !image.isPublished),
    [filtered, selected]
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every((image) => selected.has(image.id))

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((image) => next.delete(image.id))
      } else {
        filtered.forEach((image) => next.add(image.id))
      }
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const changeTab = (t: Tab) => {
    setTab(t)
    clearSelection()
  }

  const approveOne = async (image: GalleryImageRow) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/gallery/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true }),
      })
      if (!res.ok) throw new Error()
      show('Photo approved')
      router.refresh()
    } catch {
      show('Failed to approve photo', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteOne = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/gallery/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      show('Photo deleted')
      router.refresh()
    } catch {
      show('Failed to delete photo', 'error')
    } finally {
      setBusy(false)
      setDeleteTarget(null)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/gallery/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action: bulkAction }),
      })
      if (!res.ok) throw new Error()
      show(bulkAction === 'approve' ? 'Photos approved' : 'Photos deleted')
      clearSelection()
      router.refresh()
    } catch {
      show(`Failed to ${bulkAction} photos`, 'error')
    } finally {
      setBusy(false)
      setBulkAction(null)
    }
  }

  if (images.length === 0) {
    return (
      <EmptyState
        icon={<PhotoIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
        title="No photos yet"
        description="Upload your first photos to start building the public gallery."
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg p-1 w-fit" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {(['all', 'pending', 'published'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => changeTab(t)}
              className="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors duration-150"
              style={
                tab === t
                  ? { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              {t} <span className="opacity-60">({counts[t]})</span>
            </button>
          ))}
        </div>

        {isAdmin && filtered.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            {allFilteredSelected ? 'Deselect all' : `Select all (${filtered.length})`}
          </button>
        )}
      </div>

      {isAdmin && selected.size > 0 && (
        <div
          className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {selected.size} selected
          </p>
          <div className="flex items-center gap-2">
            {hasPendingSelected && (
              <button
                onClick={() => setBulkAction('approve')}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <CheckIcon className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
                <span style={{ color: 'var(--bg-primary)' }}>Approve selected</span>
              </button>
            )}
            <button
              onClick={() => setBulkAction('delete')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-500/10"
              style={{ borderColor: 'var(--border-custom)' }}
            >
              <TrashIcon className="w-4 h-4 text-red-500" />
              <span className="text-red-500">Delete selected</span>
            </button>
            <button
              onClick={clearSelection}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PhotoIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
          title="No photos here"
          description="Nothing matches this filter yet."
        />
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {filtered.map((image) => (
            <div key={image.id} className="relative group mb-4 break-inside-avoid rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-custom)' }}>
              {isAdmin && (
                <button
                  onClick={() => toggleSelected(image.id)}
                  className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-150"
                  style={{
                    borderColor: 'white',
                    backgroundColor: selected.has(image.id) ? 'var(--accent-color)' : 'rgba(0,0,0,0.35)',
                  }}
                >
                  {selected.has(image.id) && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </button>
              )}

              <img src={image.url} alt={image.caption || ''} className="w-full h-auto block" loading="lazy" />

              <div className="absolute top-2 right-2 z-10">
                <StatusBadge isPublished={image.isPublished} />
              </div>

              {isAdmin && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-gradient-to-t from-black/60 to-transparent">
                  {!image.isPublished && (
                    <button
                      onClick={() => approveOne(image)}
                      disabled={busy}
                      title="Approve"
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white transition-colors duration-150 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 text-emerald-600" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(image)}
                    disabled={busy}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white transition-colors duration-150 disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete photo?"
        description="This photo will be permanently removed from the gallery. This can't be undone."
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={handleDeleteOne}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkAction === 'delete'}
        title={`Delete ${selected.size} photo${selected.size === 1 ? '' : 's'}?`}
        description="These photos will be permanently removed from the gallery. This can't be undone."
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={handleBulkAction}
        onCancel={() => setBulkAction(null)}
      />

      <ConfirmDialog
        open={bulkAction === 'approve'}
        title={`Approve ${selected.size} photo${selected.size === 1 ? '' : 's'}?`}
        description="These photos will become visible on the public gallery."
        confirmLabel="Approve"
        busy={busy}
        onConfirm={handleBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  )
}
