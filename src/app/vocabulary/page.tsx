'use client';
import { useState, useEffect, useCallback } from 'react';
import { DataTable, TableColumn, SortState } from '@/components/data-table/DataTable';
import { Button } from '@/components/button/Button';
import { Dialog } from '@/components/dialog/Dialog';
import { TextField } from '@/components/text-field/TextField';
import { Badge } from '@/components/badge/Badge';
import { CheckboxField } from '@/components/checkbox-field/CheckboxField';
import { FileChooserField } from '@/components/file-chooser-field/FileChooserField';
import { useAuth } from '@/hooks/useAuth';
import { authenticatedFetchWithRefresh } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface VocabularyMeaning {
  id: number;
  meaning: string;
  languageCode: string;
  exampleSentence?: string | null;
  displayOrder: number;
}

interface VocabularyCategory {
  id: number;
  name: string;
}

interface VocabularyPronunciation {
  id: number;
  dialect: string;
  ipa?: string | null;
  audioUrl?: string | null;
  displayOrder: number;
}

interface Vocabulary {
  id: number;
  word: string;
  level?: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  meanings: VocabularyMeaning[];
  categories: VocabularyCategory[];
  pronunciations: VocabularyPronunciation[];
}

interface FormMeaning {
  meaning: string;
  exampleSentence: string;
  languageCode: string;
}

interface FormPronunciation {
  dialect: string;
  ipa: string;
  audioFile?: File | null;
}

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'word', label: 'Word', sortable: true, filterable: true },
  { key: 'level', label: 'Level', sortable: true, width: '130px' },
  { key: 'meaning', label: 'Meaning' },
  { key: 'pronunciation', label: 'Pronunciation', width: '160px' },
  { key: 'actions', label: '', width: '120px' },
];

function levelBadge(level?: string) {
  if (!level) return null;
  const variantMap: Record<string, 'info' | 'warning' | 'danger'> = {
    BEGINNER: 'info',
    INTERMEDIATE: 'warning',
    ADVANCED: 'danger',
  };
  return (
    <Badge variant={variantMap[level] ?? 'info'} size="sm">
      {level}
    </Badge>
  );
}

function emptyForm() {
  return {
    word: '',
    level: '',
    topic: '',
    isActive: true,
    meanings: [{ meaning: '', exampleSentence: '', languageCode: 'vi' }] as FormMeaning[],
    pronunciations: [{ dialect: '', ipa: '' }] as FormPronunciation[],
  };
}

export default function VocabularyPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortState | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Vocabulary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vocabulary | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(sort?.key ? { sortBy: sort.key, sortOrder: sort.direction ?? 'asc' } : {}),
      });
      const res = await authenticatedFetchWithRefresh(`${API_BASE}/public/vocabulary?${params}`);
      if (!res.ok) throw new Error('Failed to fetch vocabulary');
      const json = await res.json();
      const data = json.data?.items ?? [];
      setItems(data);
      setTotal(json.data?.pagination?.total ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function updateMeaning(i: number, field: keyof FormMeaning, v: string) {
    setForm((f) => ({
      ...f,
      meanings: f.meanings.map((m, idx) => (idx === i ? { ...m, [field]: v } : m)),
    }));
  }
  function addMeaning() {
    setForm((f) => ({
      ...f,
      meanings: [...f.meanings, { meaning: '', exampleSentence: '', languageCode: 'vi' }],
    }));
  }
  function removeMeaning(i: number) {
    setForm((f) => ({ ...f, meanings: f.meanings.filter((_, idx) => idx !== i) }));
  }
  function updatePron(i: number, field: keyof FormPronunciation, v: string) {
    setForm((f) => ({
      ...f,
      pronunciations: f.pronunciations.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)),
    }));
  }
  function addPron() {
    setForm((f) => ({ ...f, pronunciations: [...f.pronunciations, { dialect: '', ipa: '' }] }));
  }
  function removePron(i: number) {
    setForm((f) => ({ ...f, pronunciations: f.pronunciations.filter((_, idx) => idx !== i) }));
  }

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm());
    setError('');
    setDialogOpen(true);
  }

  function openEdit(item: Vocabulary) {
    setEditItem(item);
    setForm({
      word: item.word,
      level: item.level ?? '',
      topic: item.categories?.[0]?.name ?? '',
      isActive: true,
      meanings: item.meanings?.length
        ? item.meanings.map((m) => ({
            meaning: m.meaning,
            exampleSentence: m.exampleSentence ?? '',
            languageCode: m.languageCode,
          }))
        : [{ meaning: '', exampleSentence: '', languageCode: 'vi' }],
      pronunciations: item.pronunciations?.length
        ? item.pronunciations.map((p) => ({ dialect: p.dialect, ipa: p.ipa ?? '' }))
        : [{ dialect: '', ipa: '' }],
    });
    setError('');
    setDialogOpen(true);
  }

  function openDelete(item: Vocabulary) {
    setDeleteTarget(item);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.word.trim()) {
      setError('Word is required');
      return;
    }
    const validMeanings = form.meanings.filter((m) => m.meaning.trim());
    if (validMeanings.length === 0) {
      setError('At least one meaning is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('word', form.word.trim());
      if (form.level) fd.append('level', form.level);
      if (form.topic.trim()) fd.append('topic', form.topic.trim());
      if (editItem) fd.append('isActive', String(form.isActive));
      fd.append(
        'meanings',
        JSON.stringify(
          validMeanings.map((m, i) => ({
            meaning: m.meaning.trim(),
            ...(m.exampleSentence?.trim() ? { exampleSentence: m.exampleSentence.trim() } : {}),
            languageCode: m.languageCode || 'vi',
            displayOrder: i + 1,
          })),
        ),
      );
      const validProns = form.pronunciations.filter((p) => p.dialect.trim());
      if (validProns.length > 0) {
        fd.append(
          'pronunciations',
          JSON.stringify(
            validProns.map((p, i) => ({
              dialect: p.dialect.trim(),
              ...(p.ipa?.trim() ? { ipa: p.ipa.trim() } : {}),
              displayOrder: i + 1,
            })),
          ),
        );
        validProns.forEach((p, i) => {
          if (p.audioFile) fd.append(`audio_${i}`, p.audioFile);
        });
      }
      const url = editItem
        ? `${API_BASE}/private/vocabulary/${editItem.id}`
        : `${API_BASE}/private/vocabulary`;
      const res = await authenticatedFetchWithRefresh(url, {
        method: editItem ? 'PATCH' : 'POST',
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message ?? 'Save failed');
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await authenticatedFetchWithRefresh(`${API_BASE}/private/vocabulary/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      setDeleteDialogOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  const tableData = items.map((item) => ({
    ...item,
    level: levelBadge(item.level),
    meaning: item.meanings?.[0]?.meaning ?? '—',
    pronunciation: item.pronunciations?.[0]
      ? `${item.pronunciations[0].dialect}${item.pronunciations[0].ipa ? ' ' + item.pronunciations[0].ipa : ''}`
      : '—',
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => openDelete(item)}>
          Delete
        </Button>
      </div>
    ),
  }));

  const totalPages = Math.ceil(total / limit);

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
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
          <Button variant="primary" onClick={openCreate}>
            + New Word
          </Button>
        </div>

        <DataTable
          columns={COLUMNS}
          data={tableData}
          loading={loading}
          emptyMessage="No vocabulary found."
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          page={page}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={setPage}
        />
      </section>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        title={editItem ? 'Edit Vocabulary' : 'New Vocabulary'}
        size="lg"
        onClose={() => setDialogOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="validate-message">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <TextField
              label="Word"
              placeholder="e.g. abundant"
              required
              value={form.word}
              onChange={(v) => setForm((f) => ({ ...f, word: v }))}
            />
            <TextField
              label="Level"
              placeholder="BEGINNER / INTERMEDIATE / ADVANCED"
              value={form.level}
              onChange={(v) => setForm((f) => ({ ...f, level: v }))}
            />
          </div>

          <TextField
            label="Topic / Category"
            placeholder="e.g. food, nature, travel"
            value={form.topic}
            onChange={(v) => setForm((f) => ({ ...f, topic: v }))}
          />

          <div>
            <div className="field-label" style={{ marginBottom: '0.5rem' }}>
              Meanings
            </div>
            {form.meanings.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '0.625rem',
                  padding: '0.75rem',
                  border: '1px solid var(--divider)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label={`Meaning ${i + 1}`}
                      placeholder="e.g. dồi dào, phong phú"
                      required={i === 0}
                      value={m.meaning}
                      onChange={(v) => updateMeaning(i, 'meaning', v)}
                    />
                  </div>
                  <div style={{ width: '64px' }}>
                    <TextField
                      label="Lang"
                      placeholder="vi"
                      value={m.languageCode}
                      onChange={(v) => updateMeaning(i, 'languageCode', v)}
                    />
                  </div>
                  {form.meanings.length > 1 && (
                    <Button size="md" variant="danger" onClick={() => removeMeaning(i)}>
                      ✕
                    </Button>
                  )}
                </div>
                <TextField
                  label="Example Sentence"
                  placeholder="e.g. The forest is abundant in wildlife."
                  value={m.exampleSentence}
                  onChange={(v) => updateMeaning(i, 'exampleSentence', v)}
                />
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={addMeaning}>
              + Add Meaning
            </Button>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '0.5rem' }}>
              Pronunciations
            </div>
            {form.pronunciations.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '0.625rem',
                  padding: '0.75rem',
                  border: '1px solid var(--divider)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ width: '80px' }}>
                    <TextField
                      label="Dialect"
                      placeholder="US / UK"
                      value={p.dialect}
                      onChange={(v) => updatePron(i, 'dialect', v)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="IPA"
                      placeholder="e.g. /əˈbʌn.dənt/"
                      value={p.ipa}
                      onChange={(v) => updatePron(i, 'ipa', v)}
                    />
                  </div>
                  {form.pronunciations.length > 1 && (
                    <Button size="md" variant="danger" onClick={() => removePron(i)}>
                      ✕
                    </Button>
                  )}
                </div>
                <FileChooserField
                  label="Audio file"
                  accept="audio/*"
                  value={p.audioFile ?? null}
                  hint="MP3, WAV, OGG, etc."
                  onChange={(file) =>
                    setForm((f) => ({
                      ...f,
                      pronunciations: f.pronunciations.map((pp, idx) =>
                        idx === i ? { ...pp, audioFile: file } : pp,
                      ),
                    }))
                  }
                />
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={addPron}>
              + Add Pronunciation
            </Button>
          </div>

          {editItem && (
            <CheckboxField
              label="Active"
              checked={form.isActive}
              onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
          )}
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
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.word}</strong>? This action cannot
          be undone.
        </p>
      </Dialog>
    </div>
  );
}
