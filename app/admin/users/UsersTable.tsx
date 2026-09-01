'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, UsersIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Avatar from '../_components/Avatar'
import RoleBadge from '../_components/RoleBadge'
import EmptyState from '../_components/EmptyState'
import { useToast } from '../_components/Toast'

interface UserRow {
  id: string
  name: string | null
  email: string | null
  role: string
  userType: string
  createdAt: string
}

const ROLES = ['USER', 'HOST', 'ADMIN', 'HR_MANAGER']

export default function UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter()
  const { show } = useToast()
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return users
    const q = query.trim().toLowerCase()
    return users.filter(
      (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    )
  }, [users, query])

  const handleRoleChange = async (userId: string, role: string) => {
    setBusyId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update role')
      show(`Role updated to ${role}`)
      router.refresh()
    } catch (err: any) {
      show(err.message || 'Failed to update role', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
        title="No users found"
        description="Users will appear here once they sign up."
      />
    )
  }

  return (
    <div>
      <div className="relative max-w-sm mb-5">
        <MagnifyingGlassIcon
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-secondary)' }}
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
          title="No matching users"
          description="Try a different search term."
        />
      ) : (
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
        >
          {filtered.map((user, i) => {
            const isSelf = user.id === currentUserId
            return (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4"
                style={i > 0 ? { borderTop: '1px solid var(--border-custom)' } : undefined}
              >
                <Avatar name={user.name} email={user.email} size={38} />
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.name || 'Unnamed User'}
                    </p>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                    {user.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSelf ? (
                    <div
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg"
                      style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}
                    >
                      <LockClosedIcon className="w-3.5 h-3.5" />
                      That's you
                    </div>
                  ) : (
                    <select
                      value={user.role}
                      disabled={busyId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm px-3 py-2 rounded-lg border disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {busyId && (
        <div className="fixed bottom-4 right-4 z-[100]">
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--text-secondary)', borderTopColor: 'transparent' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Updating role...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
