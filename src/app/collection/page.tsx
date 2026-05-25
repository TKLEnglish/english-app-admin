'use client';
import { useState, useEffect, useCallback } from 'react';
import { DataTable, TableColumn, SortState } from '@/components/data-table/DataTable';
import { Button } from '@/components/button/Button';
import { Dialog } from '@/components/dialog/Dialog';
import { TextField } from '@/components/text-field/TextField';
import { CheckboxField } from '@/components/checkbox-field/CheckboxField';
import { FileChooserField } from '@/components/file-chooser-field/FileChooserField';
import { Badge } from '@/components/badge/Badge';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface Collection {
  id: number;
  name: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
}

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'description', label: 'Description', filterable: true },
  { key: 'isPublic', label: 'Visibility', width: '80px' },
  { key: 'createdAt', label: 'Created', sortable: true, width: '140px' },
  { key: 'actions', label: '', width: '120px' },
];

const WORD_IMPORT_PATTERN = /^[\p{L}][\p{L}\p{N}' -]*$/u;
const MAX_WORD_LENGTH = 64;

function emptyForm() {
  return { name: '', description: '', isPublic: false };
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export default function CollectionPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Collection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortState | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

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
      const res = await fetch(`${API_BASE}/public/collection?${params}`);
      if (!res.ok) throw new Error('Failed to fetch collections');
      const json = await res.json();
      const data = json.data?.items ?? [];
      setItems(data);
      setTotal(json.data?.pagination?.total ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm());
    setError('');
    setImportFile(null);
    setImportError('');
    setImportSuccess('');
    setDialogOpen(true);
  }

  function openEdit(item: Collection) {
    setEditItem(item);
    setForm({ name: item.name, description: item.description ?? '', isPublic: item.isPublic ?? false });
    setError('');
    setImportFile(null);
    setImportError('');
    setImportSuccess('');
    setDialogOpen(true);
  }

  function openDelete(item: Collection) {
    setDeleteTarget(item);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || undefined,
        isPublic: form.isPublic,
      };
      const url = editItem
        ? `${API_BASE}/private/collection/${editItem.id}`
        : `${API_BASE}/private/collection`;
      const res = await fetch(url, {
        method: editItem ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token.access}` } : {}),
        },
        body: JSON.stringify(payload),
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
      await fetch(`${API_BASE}/private/collection/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token.access}` } : {},
      });
      setDeleteDialogOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  async function handleImportWords() {
    if (!editItem) {
      setImportError('Cannot import words to a new collection. Please save the collection first.');
      return;
    }
    if (!importFile) {
      setImportError('Please choose a .txt file to import.');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const content = await importFile.text();
      const rawWords = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const words = [...new Set(rawWords)];
      const duplicateCount = rawWords.length - words.length;
      if (!words.length) {
        throw new Error('File is empty. Please provide one word per line.');
      }
      const invalidWords = words.filter(
        (word) => word.length > MAX_WORD_LENGTH || !WORD_IMPORT_PATTERN.test(word),
      );
      if (invalidWords.length) {
        throw new Error(
          `Invalid word format in file: ${invalidWords.slice(0, 3).join(', ')}${invalidWords.length > 3 ? ', ...' : ''}.`,
        );
      }

      const url = `${API_BASE}/private/collection/${editItem.id}/import-words`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token.access}` } : {}),
        },
        body: JSON.stringify({ words }),
      });

      if (!res.ok) {
        let message = 'Import failed';
        try {
          const data = await res.json();
          message = data?.message ?? message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      setImportSuccess(
        `Imported ${words.length} ${pluralize(words.length, 'word')} successfully${duplicateCount > 0 ? ` (${duplicateCount} ${pluralize(duplicateCount, 'duplicate')} skipped)` : ''}.`,
      );
      setImportFile(null);
      fetchData();
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  const tableData = items.map((item) => ({
    ...item,
    description: item.description ?? '—',
    isPublic: item.isPublic ? (
      <Badge variant="success" size="sm">Yes</Badge>
    ) : (
      <Badge variant="secondary" size="sm">No</Badge>
    ),
    createdAt: new Date(item.createdAt).toLocaleDateString(),
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
        <h1 className="page-title">Collections</h1>
        <p className="page-description">Manage vocabulary collections and topics.</p>
      </header>

      <section className="demo-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Search"
              placeholder="Search by name…"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
          <Button variant="primary" onClick={openCreate}>
            + New Collection
          </Button>
        </div>

        <DataTable
          columns={COLUMNS}
          data={tableData}
          loading={loading}
          emptyMessage="No collections found."
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
        title={editItem ? 'Edit Collection' : 'New Collection'}
        size="md"
        onClose={() => {
          setDialogOpen(false);
          setImportError('');
          setImportSuccess('');
          setImportFile(null);
        }}
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
          {importError && <div className="validate-message">{importError}</div>}
          {importSuccess && (
            <div className="field-hint" style={{ color: 'var(--success, #16a34a)' }}>
              {importSuccess}
            </div>
          )}
          <TextField
            label="Name"
            placeholder="e.g. Animal Words"
            required
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <TextField
            label="Description"
            placeholder="Optional description"
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          />
          <CheckboxField
            key={editItem?.id ?? 'new'}
            label="Public"
            hint="When checked, this collection is visible to all users."
            checked={form.isPublic}
            onChange={(v) => setForm((f) => ({ ...f, isPublic: v }))}
          />
          {editItem && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--divider)',
              }}
            >
              <FileChooserField
                label="Import words from TXT"
                accept=".txt,text/plain"
                value={importFile}
                hint="One word per line."
                onChange={setImportFile}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={handleImportWords} loading={importing}>
                  Import
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        title="Delete Collection"
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
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot
          be undone.
        </p>
      </Dialog>
    </div>
  );
}
