'use client'
import { useState } from 'react'
import { DataTable, TableColumn, SortState } from '@/components/data-table/DataTable'
import { Button } from '@/components/button/Button'

const COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '60px' },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const DATA = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Pending' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', status: 'Active' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', role: 'Editor', status: 'Active' },
  { id: 8, name: 'Henry Moore', email: 'henry@example.com', role: 'Viewer', status: 'Inactive' },
]

export default function DataTablePage() {
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<SortState | null>(null)
  const [page, setPage] = useState(1)
  
  const itemsPerPage = 3
  const allItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'Editor', 'Viewer'][i % 3],
    status: ['Active', 'Inactive', 'Pending'][i % 3],
  }))
  
  const paginatedData = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(allItems.length / itemsPerPage)

  function simulate() {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Data Table</h1>
        <p className="page-description">Sortable and filterable table with skeleton loading state.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">with Sort &amp; Filter</h2>
        <div className="demo-card">
          <DataTable
            columns={COLUMNS}
            data={DATA}
            filterable
            filterPlaceholder="Search by name or email…"
            onSortChange={setSort}
          />
          {sort && <p className="demo-value" style={{ marginTop: '0.75rem' }}>Sort: {sort.key} {sort.direction}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Loading State</h2>
        <div className="demo-card">
          <Button variant="secondary" onClick={simulate} style={{ marginBottom: '1rem' }}>Simulate Loading</Button>
          <DataTable columns={COLUMNS} data={DATA} loading={loading} />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Empty State</h2>
        <div className="demo-card">
          <DataTable columns={COLUMNS} data={[]} emptyMessage="No users found." />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">with Pagination</h2>
        <div className="demo-card">
          <DataTable
            columns={COLUMNS}
            data={paginatedData}
            filterable
            filterPlaceholder="Search by name or email…"
            onSortChange={setSort}
            page={page}
            totalPages={totalPages}
            totalItems={allItems.length}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  )
}
