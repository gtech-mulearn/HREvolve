'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CameraIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import ConfirmDialog from '../_components/ConfirmDialog'
import EmptyState from '../_components/EmptyState'
import Avatar from '../_components/Avatar'
import { useToast } from '../_components/Toast'
import { CITIES, CITY_LABELS, type CityValue } from '@/lib/cities'

interface MemberRow {
  id: string
  name: string
  role: string | null
  imageUrl: string | null
  linkedinUrl: string | null
  city: string
  order: number
}

interface FormState {
  name: string
  role: string
  linkedinUrl: string
  order: string
}

const EMPTY_FORM: FormState = { name: '', role: '', linkedinUrl: '', order: '0' }

const inputClass = 'w-full px-3 py-2 rounded-lg border text-sm bg-transparent'
const inputStyle = { borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }

export default function TeamManager({ members }: { members: MemberRow[] }) {
  const router = useRouter()
  const { show } = useToast()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [city, setCity] = useState<CityValue>(CITIES[0].value)
  // null = form closed, 'new' = adding, otherwise the id being edited
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const cityMembers = members.filter((m) => m.city === city)

  const openForm = (member?: MemberRow) => {
    setEditing(member ? member.id : 'new')
    setForm(
      member
        ? {
            name: member.name,
            role: member.role || '',
            linkedinUrl: member.linkedinUrl || '',
            order: String(member.order),
          }
        : { ...EMPTY_FORM, order: String(cityMembers.length) }
    )
    setPhoto(null)
    setPhotoPreview(member?.imageUrl || null)
  }

  const closeForm = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPhoto(null)
    setPhotoPreview(null)
  }

  const handlePhoto = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      show('Please choose an image file', 'error')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      show('Name is required', 'error')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('role', form.role)
      formData.append('linkedinUrl', form.linkedinUrl)
      formData.append('order', form.order)
      formData.append('city', city)
      if (photo) formData.append('photo', photo)

      const isNew = editing === 'new'
      const res = await fetch(isNew ? '/api/admin/team' : `/api/admin/team/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      show(isNew ? `${form.name} added to ${CITY_LABELS[city]}` : 'Changes saved')
      closeForm()
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/team/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      show('Team member removed')
      if (editing === deleteTarget.id) closeForm()
      router.refresh()
    } catch {
      show('Failed to remove team member', 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCity(c.value)
                closeForm()
              }}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150"
              style={
                city === c.value
                  ? { backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }
                  : { color: 'var(--text-secondary)', borderColor: 'var(--border-custom)' }
              }
            >
              <span style={city === c.value ? { color: 'var(--bg-primary)' } : undefined}>
                {c.label} <span className="opacity-60">({members.filter((m) => m.city === c.value).length})</span>
              </span>
            </button>
          ))}
        </div>
        {editing === null && (
          <button
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <PlusIcon className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
            <span style={{ color: 'var(--bg-primary)' }}>Add member</span>
          </button>
        )}
      </div>

      {editing !== null && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border shadow-sm p-5 sm:p-6 mb-6 flex flex-col sm:flex-row gap-5"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
        >
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="relative w-28 h-28 rounded-2xl border-2 border-dashed flex-shrink-0 overflow-hidden flex items-center justify-center self-center sm:self-start"
            style={{ borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-primary)' }}
            title="Choose photo"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <CameraIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Photo</span>
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handlePhoto(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </button>

          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name *"
              className={inputClass}
              style={inputStyle}
              required
            />
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Role (e.g. Chapter Lead)"
              className={inputClass}
              style={inputStyle}
            />
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="LinkedIn profile URL"
                className={`${inputClass} pl-8`}
                style={inputStyle}
              />
            </div>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              placeholder="Display order"
              title="Lower numbers are shown first"
              className={inputClass}
              style={inputStyle}
            />
            <div className="sm:col-span-2 flex items-center justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: 'var(--border-custom)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <span style={{ color: 'var(--bg-primary)' }}>
                  {saving ? 'Saving…' : editing === 'new' ? `Add to ${CITY_LABELS[city]}` : 'Save changes'}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}

      {cityMembers.length === 0 ? (
        <EmptyState
          icon={<UserGroupIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
          title={`No ${CITY_LABELS[city]} team members yet`}
          description="Add the people behind this chapter. They'll appear on the city's chapter page."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cityMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border shadow-sm p-4 flex items-center gap-3"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
            >
              {member.imageUrl ? (
                <img src={member.imageUrl} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <Avatar name={member.name} size={56} />
              )}
              <div className="min-w-0 flex-grow">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {member.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {member.role || 'No role set'} · #{member.order}
                </p>
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline-offset-2 hover:underline"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => openForm(member)}
                  title="Edit"
                  className="p-2 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <PencilSquareIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button
                  onClick={() => setDeleteTarget(member)}
                  title="Remove"
                  className="p-2 rounded-lg transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove team member?"
        description={`${deleteTarget?.name || 'This person'} will be removed from the ${CITY_LABELS[city]} chapter page. This can't be undone.`}
        confirmLabel="Remove"
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
