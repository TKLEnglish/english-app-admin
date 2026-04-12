'use client'
import { useState, useEffect, useCallback } from 'react'
import { DataTable, TableColumn, SortState } from '@/components/data-table/DataTable'
import { Button } from '@/components/button/Button'
import { Dialog } from '@/components/dialog/Dialog'
import { TextField } from '@/components/text-field/TextField'
import { Badge } from '@/components/badge/Badge'
import { useAuth } from '@/hooks/useAuth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

interface User {
  id: number
  username: string
  email?: string
  displayName?: string
  level?: string
  xp: number
  streak: number
  isActive: boolean
  createdAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'username', label: 'Username', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'displayName', label: 'Display Name', filterable: true },
  { key: 'level', label: 'Level', sortable: true, width: '110px' },
  { key: 'xp', label: 'XP', sortable: true, width: '70px' },
  { key: 'streak', label: 'Streak', sortable: true, width: '80px' },
  { key: 'status', label: 'Status', width: '90px' },
  { key: 'actions', label: '', width: '120px' },
]

function levelBadge(level?: string) {
  if (!level) return <span style={{ color: 'var(--text-muted, #888)' }}>—</span>
  const variantMap: Record<string, 'info' | 'warning' | 'danger'> = {
    BEGINNER: 'info',
    INTERMEDIATE: 'warning',
    ADVANCED: 'danger',
  }
  return <Badge variant={variantMap[level] ?? 'info'} size="sm">{level}</Badge>
}

export default function UsersPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<SortState | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [form, setForm] = useState({ level: '', isActive: 'true' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const limit = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(sort?.key ? { sortBy: sort.key, sortOrder: sort.direction ?? 'asc' } : {}),
      })
      const res = await fetch(`${API_BASE}/private/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const json = await res.json()
      const data = json.data?.items ?? []
      setItems(data)
      setTotal(json.data?.pagination?.total ?? 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, search, sort])

  useEffect(() => { fetchData() }, [fetchData])

  function openEdit(item: User) {
    setEditItem(item)
    setForm({ level: item.level ?? '', isActive: String(item.isActive) })
    setError('')
    setEditDialogOpen(true)
  }

  function openDelete(item: User) {
    setDeleteTarget(item)
    setDeleteDialogOpen(true)
  }

  async function handleSave() {
    if (!editItem) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        level: form.level || undefined,
        isActive: form.isActive === 'true',
      }
      const res = await fetch(`${API_BASE}/private/users/${editItem.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token.access}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message ?? 'Save failed')
      }
      setEditDialogOpen(false)
      fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await fetch(`${API_BASE}/private/users/${deleteTarget.id}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token.access}` } : {},
      })
      setDeleteDialogOpen(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const tableData = items.map(item => ({
    ...item,
    email: item.email ?? '—',
    displayName: item.displayName ?? '—',
    level: levelBadge(item.level),
    status: <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">{item.isActive ? 'Active' : 'Inactive'}</Badge>,
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => openDelete(item)}>Delete</Button>
      </div>
    ),
  }))

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-description">View and manage app user accounts.</p>
      </header>

      <section className="demo-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Search"
              placeholder="Search by username or email…"
              value={search}
              onChange={v => { setSearch(v); setPage(1) }}
            />
          </div>
        </div>

        <div className="demo-card">
          <DataTable
            columns={COLUMNS}
            data={tableData}
            loading={loading}
            emptyMessage="No users found."
            onSortChange={s => { setSort(s); setPage(1) }}
            page={page}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setPage}
          />
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        title="Edit User"
        size="sm"
        onClose={() => setEditDialogOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="validate-message">{error}</div>}
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Editing: <strong>{editItem?.username}</strong>
          </p>
          <TextField
            label="Level"
            placeholder="BEGINNER / INTERMEDIATE / ADVANCED"
            value={form.level}
            onChange={v => setForm(f => ({ ...f, level: v }))}
          />
          <div className="field">
            <label className="field-label">Status</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="radio" name="isActive" value="true" checked={form.isActive === 'true'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value }))} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="radio" name="isActive" value="false" checked={form.isActive === 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value }))} />
                Inactive
              </label>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        title="Delete User"
        size="sm"
        onClose={() => setDeleteDialogOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
          </div>
        }
      >
        <p>Are you sure you want to delete user <strong>{deleteTarget?.username}</strong>? This is a soft delete and can be recovered.</p>
      </Dialog>
    </div>
  )
}
