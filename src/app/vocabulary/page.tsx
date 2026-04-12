'use client'
import { useState, useEffect, useCallback } from 'react'
import { DataTable, TableColumn, SortState } from '@/components/data-table/DataTable'
import { Button } from '@/components/button/Button'
import { Dialog } from '@/components/dialog/Dialog'
import { TextField } from '@/components/text-field/TextField'
import { Badge } from '@/components/badge/Badge'
import { CheckboxField } from '@/components/checkbox-field/CheckboxField'
import { useAuth } from '@/hooks/useAuth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

interface VocabularyMeaning {
  id: number
  meaning: string
  languageCode: string
  exampleSentence?: string
  exampleTranslation?: string
}

interface VocabularyCategory {
  id: number
  name: string
}

interface VocabularyPronunciation {
  id: number
  ipa: string
  audioUrl?: string
}

interface VocabularyForm {
  id: number
  formType: string
  value: string
}

interface Vocabulary {
  id: number
  word: string
  partOfSpeech?: string
  level?: string
  difficulty: number
  imageUrl?: string
  imagePublicId?: string
  isActive: boolean
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
  meanings: VocabularyMeaning[]
  categories: VocabularyCategory[]
  pronunciations: VocabularyPronunciation[]
  forms: VocabularyForm[]
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'word', label: 'Word', sortable: true, filterable: true },
  { key: 'partOfSpeech', label: 'Part of Speech', sortable: true },
  { key: 'level', label: 'Level', sortable: true },
  { key: 'difficulty', label: 'Difficulty', sortable: true, width: '90px' },
  { key: 'isActive', label: 'Status', sortable: true, width: '90px' },
  { key: 'actions', label: '', width: '120px' },
]

function levelBadge(level?: string) {
  if (!level) return null
  const variantMap: Record<string, 'info' | 'warning' | 'danger'> = {
    BEGINNER: 'info',
    INTERMEDIATE: 'warning',
    ADVANCED: 'danger',
  }
  return <Badge variant={variantMap[level] ?? 'info'} size="sm">{level}</Badge>
}

function emptyForm() {
  return { 
    word: '', 
    partOfSpeech: '', 
    level: '', 
    difficulty: '1', 
    imageUrl: '',
    isActive: true,
    meaning: '', 
    exampleSentence: '',
    ipa: '',
    categories: '',
  }
}

export default function VocabularyPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Vocabulary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<SortState | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Vocabulary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vocabulary | null>(null)
  const [form, setForm] = useState(emptyForm())
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
      const res = await fetch(`${API_BASE}/public/vocabulary?${params}`)
      if (!res.ok) throw new Error('Failed to fetch vocabulary')
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

  function openCreate() {
    setEditItem(null)
    setForm(emptyForm())
    setError('')
    setDialogOpen(true)
  }

  function openEdit(item: Vocabulary) {
    setEditItem(item)
    setForm({
      word: item.word,
      ipa: item.pronunciations?.[0]?.ipa ?? '',
      partOfSpeech: item.partOfSpeech ?? '',
      level: item.level ?? '',
      difficulty: String(item.difficulty),
      imageUrl: item.imageUrl ?? '',
      isActive: item.isActive,
      meaning: item.meanings?.[0]?.meaning ?? '',
      exampleSentence: item.meanings?.[0]?.exampleSentence ?? '',
      categories: item.categories?.map(c => c.name).join(', ') ?? '',
    })
    setError('')
    setDialogOpen(true)
  }

  function openDelete(item: Vocabulary) {
    setDeleteTarget(item)
    setDeleteDialogOpen(true)
  }

  async function handleSave() {
    if (!form.word.trim()) { setError('Word is required'); return }
    if (!form.meaning.trim()) { setError('Meaning is required'); return }
    setSaving(true)
    setError('')
    try {
      const categoriesArray = form.categories
        ? form.categories.split(',').map(c => c.trim()).filter(Boolean)
        : []
      
      const payload = {
        word: form.word.trim(),
        partOfSpeech: form.partOfSpeech || undefined,
        level: form.level || undefined,
        difficulty: parseInt(form.difficulty) || 1,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
        meaning: form.meaning || undefined,
        exampleSentence: form.exampleSentence || undefined,
        ipa: form.ipa || undefined,
        categories: categoriesArray.length > 0 ? categoriesArray : undefined,
      }
      const url = editItem
        ? `${API_BASE}/private/vocabulary/${editItem.id}`
        : `${API_BASE}/private/vocabulary`
      const res = await fetch(url, {
        method: editItem ? 'PATCH' : 'POST',
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
      setDialogOpen(false)
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
      await fetch(`${API_BASE}/private/vocabulary/${deleteTarget.id}`, { 
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
    partOfSpeech: item.partOfSpeech ?? '—',
    level: levelBadge(item.level),
    isActive: item.isActive ? <Badge variant="info" size="sm">Active</Badge> : <Badge variant="warning" size="sm">Inactive</Badge>,
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
        <h1 className="page-title">Vocabulary</h1>
        <p className="page-description">Manage vocabulary words, meanings, and metadata.</p>
      </header>

      <section className="demo-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Search"
              placeholder="Search by word…"
              value={search}
              onChange={v => { setSearch(v); setPage(1) }}
            />
          </div>
          <Button variant="primary" onClick={openCreate}>+ New Word</Button>
        </div>

        <div className="demo-card">
          <DataTable
            columns={COLUMNS}
            data={tableData}
            loading={loading}
            emptyMessage="No vocabulary found."
            onSortChange={s => { setSort(s); setPage(1) }}
            page={page}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setPage}
          />
        </div>
      </section>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        title={editItem ? 'Edit Vocabulary' : 'New Vocabulary'}
        size="lg"
        onClose={() => setDialogOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="validate-message">{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <TextField label="Word" placeholder="e.g. abundant" required value={form.word} onChange={v => setForm(f => ({ ...f, word: v }))} />
            <TextField label="Part of Speech" placeholder="e.g. adjective" value={form.partOfSpeech} onChange={v => setForm(f => ({ ...f, partOfSpeech: v }))} />
            <TextField label="Level" placeholder="BEGINNER / INTERMEDIATE / ADVANCED" value={form.level} onChange={v => setForm(f => ({ ...f, level: v }))} />
            <TextField label="Difficulty (1–5)" type="number" placeholder="1" value={form.difficulty} onChange={v => setForm(f => ({ ...f, difficulty: v }))} />
          </div>

          <TextField label="IPA (Pronunciation)" placeholder="e.g. /əˈbʌn.dənt/" value={form.ipa} onChange={v => setForm(f => ({ ...f, ipa: v }))} />
          
          <TextField label="Image URL" placeholder="e.g. https://example.com/image.jpg" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />
          
          <TextField label="Categories (comma-separated)" placeholder="e.g. nature, adjective, positive" value={form.categories} onChange={v => setForm(f => ({ ...f, categories: v }))} />
          
          <TextField label="Meaning (Vietnamese)" placeholder="e.g. dồi dào, phong phú" required value={form.meaning} onChange={v => setForm(f => ({ ...f, meaning: v }))} />
          
          <TextField label="Example Sentence" placeholder="e.g. The forest is abundant in wildlife." value={form.exampleSentence} onChange={v => setForm(f => ({ ...f, exampleSentence: v }))} />

          <CheckboxField 
            label="Active" 
            checked={form.isActive} 
            onChange={v => setForm(f => ({ ...f, isActive: v }))} 
          />
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        title="Delete Vocabulary"
        size="sm"
        onClose={() => setDeleteDialogOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
          </div>
        }
      >
        <p>Are you sure you want to delete <strong>{deleteTarget?.word}</strong>? This action cannot be undone.</p>
      </Dialog>
    </div>
  )
}
