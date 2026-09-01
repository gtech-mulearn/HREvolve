'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CalendarDaysIcon,
  LinkIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { useToast } from '../_components/Toast'

interface EventFormData {
  id?: string
  title: string
  description: string
  image: string
  date: string
  time: string
  location: string
  category: string
  linkedinUrl: string
  registrationUrl: string
  isPublished: boolean
}

const emptyForm: EventFormData = {
  title: '',
  description: '',
  image: '',
  date: '',
  time: '',
  location: '',
  category: '',
  linkedinUrl: '',
  registrationUrl: '',
  isPublished: false,
}

const inputStyle = {
  backgroundColor: 'var(--bg-primary)',
  borderColor: 'var(--border-custom)',
  color: 'var(--text-primary)',
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0'

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border shadow-sm p-5 sm:p-6"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
    >
      <h3 className="font-bold text-base mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
      <div className={subtitle ? '' : 'mt-4'}>{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function EventForm({ initialData }: { initialData?: EventFormData }) {
  const router = useRouter()
  const { show } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<EventFormData>(initialData || emptyForm)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initialData?.id

  const handleChange = (field: keyof EventFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      show('Please choose an image file', 'error')
      return
    }
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/events/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      handleChange('image', data.url)
    } catch (err: any) {
      show(err.message || 'Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(
        isEdit ? `/api/admin/events/${initialData!.id}` : '/api/admin/events',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save event')
      show(isEdit ? 'Event updated' : 'Event created')
      router.push('/admin/events')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save event')
      show(err.message || 'Failed to save event', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <Field label="Title" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. HR Leadership Summit 2026"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={4}
                  placeholder="What's this event about?"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <input
                    type="text"
                    placeholder="e.g. Workshop"
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Location">
                  <input
                    type="text"
                    placeholder="e.g. Technopark, Kochi"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Date & Time" subtitle="When is this event happening?">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" required>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
              <Field label="Time">
                <input
                  type="text"
                  placeholder="10:00 AM - 12:00 PM"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </div>
          </Section>

          <Section title="Links" subtitle="Optional links visitors can use">
            <div className="space-y-4">
              <Field label="LinkedIn URL">
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/..."
                    value={form.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    className={`${inputClass} pl-9`}
                    style={inputStyle}
                  />
                </div>
              </Field>
              <Field label="Registration URL">
                <div className="relative">
                  <TagIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.registrationUrl}
                    onChange={(e) => handleChange('registrationUrl', e.target.value)}
                    className={`${inputClass} pl-9`}
                    style={inputStyle}
                  />
                </div>
              </Field>
            </div>
          </Section>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <Section title="Cover Image">
            {form.image ? (
              <div className="relative group">
                <img src={form.image} alt="Event preview" className="w-full h-40 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => handleChange('image', '')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors duration-150"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleImageUpload(file)
                }}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed h-40 flex flex-col items-center justify-center cursor-pointer transition-colors duration-150"
                style={{
                  borderColor: dragging ? 'var(--accent-color)' : 'var(--border-custom)',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 mb-2" style={{ borderColor: 'var(--text-primary)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <ArrowUpTrayIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      Click or drag an image
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </Section>

          <Section title="Visibility">
            <button
              type="button"
              onClick={() => handleChange('isPublished', !form.isPublished)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-colors duration-150"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}
            >
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {form.isPublished ? 'Published' : 'Draft'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {form.isPublished ? 'Visible on the public site' : 'Hidden from visitors'}
                </p>
              </div>
              <span
                className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200"
                style={{ backgroundColor: form.isPublished ? '#10b981' : 'var(--border-custom)' }}
              >
                <span
                  className="inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200"
                  style={{ transform: form.isPublished ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </span>
            </button>
          </Section>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 border-t px-4 py-3.5 sm:px-6 z-30"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}
      >
        <div className="max-w-7xl mx-auto flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/events')}
            className="px-5 py-2.5 rounded-lg font-medium border text-sm transition-colors duration-150"
            style={{ borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <span style={{ color: 'var(--bg-primary)' }}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}
