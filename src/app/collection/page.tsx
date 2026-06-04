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
import { authenticatedFetchWithRefresh } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const COLLECTION_PRIVATE_ENDPOINT = '/private/collections';
const IMPORT_ENDPOINT_TEMPLATES = [
  '/private/collections/:id/import-words',
  '/private/collections/:id/import',
];
const IMPORT_COLLECTION_ENDPOINT = '/private/collections/import';
const COLLECTION_VOCAB_ENDPOINT_TEMPLATES = [
  '/private/collections/:id/vocabulary',
  '/private/collections/:id/words',
  '/public/collections/:id/vocabulary',
  '/public/collections/:id/words',
];
const ADD_COLLECTION_VOCAB_ENDPOINT_TEMPLATES = [
  '/private/collections/:id/vocabulary',
  '/private/collections/:id/words',
  '/private/collections/:id/import-words',
  '/private/collections/:id/import',
];
const REMOVE_COLLECTION_VOCAB_ENDPOINT_TEMPLATES = [
  '/private/collections/:id/vocabulary/:vocabularyId',
  '/private/collections/:id/words/:vocabularyId',
];

interface Collection {
  id: number;
  name: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
}

interface CollectionVocabulary {
  id: number;
  word: string;
  level?: string;
  meaning?: string;
  createdAt?: string;
  meanings?: { meaning: string }[];
}

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'description', label: 'Description', filterable: true },
  { key: 'isPublic', label: 'Visibility', width: '80px' },
  { key: 'createdAt', label: 'Created', sortable: true, width: '140px' },
  { key: 'actions', label: '', width: '190px' },
];

const VOCAB_COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'word', label: 'Word', sortable: true, filterable: true },
  { key: 'level', label: 'Level', width: '120px' },
  { key: 'meaning', label: 'Meaning', filterable: true },
  { key: 'actions', label: '', width: '100px' },
];

const WORD_IMPORT_PATTERN = /^[\p{L}][\p{L}\p{N}' -]*$/u;
const MAX_WORD_LENGTH = 64;

function emptyForm() {
  return { name: '', description: '', isPublic: false };
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function collectionEndpoint(template: string, collectionId: number, vocabularyId?: number) {
  return `${API_BASE}${template
    .replace(':id', String(collectionId))
    .replace(':vocabularyId', String(vocabularyId ?? ''))}`;
}

async function fetchFirstAvailable(urls: string[], init?: RequestInit) {
  let lastNotFound: Response | null = null;
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const response = await authenticatedFetchWithRefresh(url, init);
      if (response.status === 404) {
        lastNotFound = response;
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown request error');
    }
  }

  if (lastNotFound) {
    return lastNotFound;
  }

  throw new Error(
    `All endpoint requests failed. Attempted: ${urls.join(', ')}` +
      (lastError ? ` (Last error: ${lastError.message})` : ''),
  );
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

  const [importCollectionDialogOpen, setImportCollectionDialogOpen] = useState(false);
  const [importCollectionFile, setImportCollectionFile] = useState<File | null>(null);
  const [importCollectionIsPublic, setImportCollectionIsPublic] = useState(false);
  const [importingCollection, setImportingCollection] = useState(false);
  const [importCollectionError, setImportCollectionError] = useState('');
  const [importCollectionSuccess, setImportCollectionSuccess] = useState('');

  const [vocabDialogOpen, setVocabDialogOpen] = useState(false);
  const [vocabCollection, setVocabCollection] = useState<Collection | null>(null);
  const [vocabItems, setVocabItems] = useState<CollectionVocabulary[]>([]);
  const [vocabTotal, setVocabTotal] = useState(0);
  const [vocabPage, setVocabPage] = useState(1);
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabLoading, setVocabLoading] = useState(false);
  const [vocabError, setVocabError] = useState('');
  const [addVocabInput, setAddVocabInput] = useState('');
  const [vocabSaving, setVocabSaving] = useState(false);

  const limit = 10;
  const vocabLimit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(sort?.key ? { sortBy: sort.key, sortOrder: sort.direction ?? 'asc' } : {}),
      });
      const res = await authenticatedFetchWithRefresh(
        `${API_BASE}${COLLECTION_PRIVATE_ENDPOINT}?${params}`,
      );
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
  }, [page, search, sort, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCollectionVocab = useCallback(async () => {
    if (!vocabCollection) return;

    setVocabLoading(true);
    setVocabError('');
    try {
      const params = new URLSearchParams({
        page: String(vocabPage),
        limit: String(vocabLimit),
        ...(vocabSearch ? { search: vocabSearch } : {}),
      });
      const urls = COLLECTION_VOCAB_ENDPOINT_TEMPLATES.map(
        (template) => `${collectionEndpoint(template, vocabCollection.id)}?${params}`,
      );
      const res = await fetchFirstAvailable(urls);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Collection vocabulary endpoint not found. Attempted: ${urls.join(', ')}`);
        }

        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to fetch collection vocabulary');
      }

      const json = await res.json();
      const responseData = json.data ?? json;
      const data =
        responseData.items ?? responseData.vocabulary ?? responseData.words ?? responseData;
      const pagination = responseData.pagination;
      const items = Array.isArray(data) ? data : [];
      setVocabItems(items);
      setVocabTotal(pagination?.total ?? responseData.total ?? items.length);
    } catch (e) {
      setVocabItems([]);
      setVocabTotal(0);
      setVocabError(e instanceof Error ? e.message : 'Failed to fetch collection vocabulary');
    } finally {
      setVocabLoading(false);
    }
  }, [vocabCollection, vocabPage, vocabSearch]);

  useEffect(() => {
    if (vocabDialogOpen) {
      fetchCollectionVocab();
    }
  }, [fetchCollectionVocab, vocabDialogOpen]);

  function openImportCollection() {
    setImportCollectionFile(null);
    setImportCollectionIsPublic(false);
    setImportCollectionError('');
    setImportCollectionSuccess('');
    setImportCollectionDialogOpen(true);
  }

  async function handleImportCollection() {
    if (!importCollectionFile) {
      setImportCollectionError('Please choose a .txt file to import.');
      return;
    }
    setImportingCollection(true);
    setImportCollectionError('');
    setImportCollectionSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', importCollectionFile);
      const url = `${API_BASE}${IMPORT_COLLECTION_ENDPOINT}${importCollectionIsPublic ? '?isPublic=true' : ''}`;
      const res = await authenticatedFetchWithRefresh(url, {
        method: 'POST',
        body: formData,
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
      const result = await res.json();
      const created = result?.data?.created ?? result?.created;
      setImportCollectionSuccess(
        created
          ? `Imported ${created} ${pluralize(created, 'collection')} successfully.`
          : 'Collections imported successfully.',
      );
      setImportCollectionFile(null);
      fetchData();
    } catch (e) {
      setImportCollectionError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImportingCollection(false);
    }
  }

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
    setForm({
      name: item.name,
      description: item.description ?? '',
      isPublic: item.isPublic ?? false,
    });
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

  function openVocabDetail(item: Collection) {
    setVocabCollection(item);
    setVocabItems([]);
    setVocabTotal(0);
    setVocabPage(1);
    setVocabSearch('');
    setVocabError('');
    setAddVocabInput('');
    setVocabDialogOpen(true);
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
        ? `${API_BASE}${COLLECTION_PRIVATE_ENDPOINT}/${editItem.id}`
        : `${API_BASE}${COLLECTION_PRIVATE_ENDPOINT}`;
      const res = await authenticatedFetchWithRefresh(url, {
        method: editItem ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      await authenticatedFetchWithRefresh(
        `${API_BASE}${COLLECTION_PRIVATE_ENDPOINT}/${deleteTarget.id}`,
        {
          method: 'DELETE',
        },
      );
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
      const rawWords = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
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

      const urls = IMPORT_ENDPOINT_TEMPLATES.map(
        (template) => `${API_BASE}${template.replace(':id', String(editItem.id))}`,
      );

      const res = await fetchFirstAvailable(urls, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Import endpoint not found. Attempted endpoints: ${urls.join(', ')}`);
        }

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

  async function handleAddVocab() {
    if (!vocabCollection) return;
    const value = addVocabInput.trim();
    if (!value) {
      setVocabError('Enter a vocabulary word or ID to add.');
      return;
    }

    setVocabSaving(true);
    setVocabError('');
    try {
      const numericId = Number(value);
      const payload =
        Number.isInteger(numericId) && numericId > 0
          ? { vocabularyId: numericId, wordId: numericId, words: [value] }
          : { word: value, words: [value] };
      const urls = ADD_COLLECTION_VOCAB_ENDPOINT_TEMPLATES.map((template) =>
        collectionEndpoint(template, vocabCollection.id),
      );
      const res = await fetchFirstAvailable(urls, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Add vocabulary endpoint not found. Attempted: ${urls.join(', ')}`);
        }

        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to add vocabulary');
      }

      setAddVocabInput('');
      setVocabPage(1);
      fetchCollectionVocab();
    } catch (e) {
      setVocabError(e instanceof Error ? e.message : 'Failed to add vocabulary');
    } finally {
      setVocabSaving(false);
    }
  }

  async function handleRemoveVocab(item: CollectionVocabulary) {
    if (!vocabCollection) return;

    setVocabSaving(true);
    setVocabError('');
    try {
      const urls = REMOVE_COLLECTION_VOCAB_ENDPOINT_TEMPLATES.map((template) =>
        collectionEndpoint(template, vocabCollection.id, item.id),
      );
      const res = await fetchFirstAvailable(urls, {
        method: 'DELETE',
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Remove vocabulary endpoint not found. Attempted: ${urls.join(', ')}`);
        }

        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to remove vocabulary');
      }

      fetchCollectionVocab();
    } catch (e) {
      setVocabError(e instanceof Error ? e.message : 'Failed to remove vocabulary');
    } finally {
      setVocabSaving(false);
    }
  }

  const tableData = items.map((item) => ({
    ...item,
    description: item.description ?? '—',
    isPublic: item.isPublic ? (
      <Badge variant="success" size="sm">
        Yes
      </Badge>
    ) : (
      <Badge variant="secondary" size="sm">
        No
      </Badge>
    ),
    createdAt: new Date(item.createdAt).toLocaleDateString(),
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="secondary" onClick={() => openVocabDetail(item)}>
          Vocab
        </Button>
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
  const vocabTotalPages = Math.ceil(vocabTotal / vocabLimit);
  const vocabTableData = vocabItems.map((item) => ({
    ...item,
    level: item.level ?? '—',
    meaning: item.meaning ?? item.meanings?.[0]?.meaning ?? '—',
    actions: (
      <Button
        size="sm"
        variant="danger"
        disabled={vocabSaving}
        onClick={() => handleRemoveVocab(item)}
      >
        Remove
      </Button>
    ),
  }));

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
          <Button variant="secondary" onClick={openImportCollection}>
            Import Collection
          </Button>
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

      {/* Collection Vocabulary Dialog */}
      <Dialog
        open={vocabDialogOpen}
        title={vocabCollection ? `${vocabCollection.name} Vocabulary` : 'Collection Vocabulary'}
        size="lg"
        onClose={() => setVocabDialogOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setVocabDialogOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {vocabError && <div className="validate-message">{vocabError}</div>}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '0.75rem',
              alignItems: 'flex-end',
            }}
          >
            <TextField
              key={`add-vocab-${vocabCollection?.id ?? 'none'}-${
                addVocabInput ? 'filled' : 'empty'
              }`}
              label="Add vocabulary"
              placeholder="Word or vocabulary ID"
              value={addVocabInput}
              onChange={setAddVocabInput}
            />
            <Button variant="primary" onClick={handleAddVocab} loading={vocabSaving}>
              Add
            </Button>
          </div>
          <TextField
            key={`search-vocab-${vocabCollection?.id ?? 'none'}`}
            label="Search vocabulary"
            placeholder="Search by word…"
            value={vocabSearch}
            onChange={(v) => {
              setVocabSearch(v);
              setVocabPage(1);
            }}
          />
          <DataTable
            columns={VOCAB_COLUMNS}
            data={vocabTableData}
            loading={vocabLoading}
            emptyMessage="No vocabulary in this collection."
            page={vocabPage}
            totalPages={vocabTotalPages}
            totalItems={vocabTotal}
            onPageChange={setVocabPage}
          />
        </div>
      </Dialog>

      {/* Import Collection Dialog */}
      <Dialog
        open={importCollectionDialogOpen}
        title="Import Collection"
        size="md"
        onClose={() => {
          setImportCollectionDialogOpen(false);
          setImportCollectionError('');
          setImportCollectionSuccess('');
          setImportCollectionFile(null);
        }}
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              onClick={() => setImportCollectionDialogOpen(false)}
              disabled={importingCollection}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImportCollection}
              loading={importingCollection}
            >
              Import
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {importCollectionError && <div className="validate-message">{importCollectionError}</div>}
          {importCollectionSuccess && (
            <div className="field-hint" style={{ color: 'var(--success, #16a34a)' }}>
              {importCollectionSuccess}
            </div>
          )}
          <FileChooserField
            label="Collection file (.txt)"
            accept=".txt,text/plain"
            value={importCollectionFile}
            hint="Format: # Collection Name, ## Sub-Collection, words on separate lines."
            onChange={setImportCollectionFile}
          />
          <CheckboxField
            label="Public"
            hint="When checked, the imported collections will be visible to all users."
            checked={importCollectionIsPublic}
            onChange={setImportCollectionIsPublic}
          />
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
