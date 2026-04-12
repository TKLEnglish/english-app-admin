'use client';
import { useState, useEffect, useCallback } from 'react';
import { DataTable, TableColumn, SortState } from '@/components/data-table/DataTable';
import { Button } from '@/components/button/Button';
import { Dialog } from '@/components/dialog/Dialog';
import { TextField } from '@/components/text-field/TextField';
import { Badge } from '@/components/badge/Badge';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'description', label: 'Description', filterable: true },
  { key: 'createdAt', label: 'Created', sortable: true, width: '140px' },
  { key: 'actions', label: '', width: '120px' },
];

function emptyForm() {
  return { name: '', description: '' };
}

export default function CategoryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortState | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
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
      const res = await fetch(`${API_BASE}/public/category?${params}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
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
    setDialogOpen(true);
  }

  function openEdit(item: Category) {
    setEditItem(item);
    setForm({ name: item.name, description: item.description ?? '' });
    setError('');
    setDialogOpen(true);
  }

  function openDelete(item: Category) {
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
      };
      const url = editItem
        ? `${API_BASE}/private/category/${editItem.id}`
        : `${API_BASE}/private/category`;
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
      await fetch(`${API_BASE}/private/category/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token.access}` } : {},
      });
      setDeleteDialogOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  const tableData = items.map((item) => ({
    ...item,
    description: item.description ?? '—',
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
        <h1 className="page-title">Categories</h1>
        <p className="page-description">Manage vocabulary categories and topics.</p>
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
            + New Category
          </Button>
        </div>

        <div className="demo-card">
          <DataTable
            columns={COLUMNS}
            data={tableData}
            loading={loading}
            emptyMessage="No categories found."
            onSortChange={(s) => {
              setSort(s);
              setPage(1);
            }}
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
        title={editItem ? 'Edit Category' : 'New Category'}
        size="md"
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
          <TextField
            label="Name"
            placeholder="e.g. Animals"
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
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        title="Delete Category"
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
