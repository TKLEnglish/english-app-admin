'use client';
import { useState, useMemo, ReactNode } from 'react';
import React from 'react';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface DataTableProps {
  columns?: TableColumn[];
  data?: Record<string, unknown>[];
  loading?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  emptyMessage?: string;
  onSortChange?: (sort: SortState) => void;
  onFilterChange?: (term: string) => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  filterable = false,
  filterPlaceholder = 'Filter rows…',
  emptyMessage = 'No data available',
  onSortChange,
  onFilterChange,
  page,
  totalPages,
  totalItems,
  onPageChange,
}: DataTableProps) {
  const [sortState, setSortState] = useState<SortState>({ key: '', direction: null });
  const [filterTerm, setFilterTerm] = useState('');

  const filterableKeys = useMemo(() => {
    const explicit = columns.filter((c) => c.filterable);
    return explicit.length > 0 ? explicit.map((c) => c.key) : columns.map((c) => c.key);
  }, [columns]);

  const filteredData = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      filterableKeys.some((k) => {
        const val = row[k];
        return val != null && String(val).toLowerCase().includes(term);
      }),
    );
  }, [data, filterTerm, filterableKeys]);

  const sortedData = useMemo(() => {
    const { key, direction } = sortState;
    const rows = [...filteredData];
    if (!key || !direction) return rows;
    return rows.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      else cmp = String(aVal).localeCompare(String(bVal));
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortState]);

  function onSort(col: TableColumn) {
    if (!col.sortable) return;
    let direction: SortDirection;
    if (sortState.key !== col.key || sortState.direction === null) direction = 'asc';
    else if (sortState.direction === 'asc') direction = 'desc';
    else direction = null;
    const next: SortState = { key: col.key, direction };
    setSortState(next);
    onSortChange?.(next);
  }

  function onFilter(e: React.ChangeEvent<HTMLInputElement>) {
    setFilterTerm(e.target.value);
    onFilterChange?.(e.target.value);
  }

  const SKELETON_ROWS = 5;

  return (
    <div className="data-table-wrapper">
      {filterable && (
        <div className="data-table-filter">
          <div className="data-table-filter-wrap">
            <svg
              className="data-table-filter-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="data-table-filter-input"
              placeholder={filterPlaceholder}
              value={filterTerm}
              onChange={onFilter}
            />
          </div>
        </div>
      )}
      <div className="data-table-container">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`dt-th${col.sortable ? ' sortable' : ''}${sortState.key === col.key && sortState.direction ? ` sort-${sortState.direction}` : ''}`}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => onSort(col)}
                    aria-sort={
                      sortState.key === col.key
                        ? sortState.direction === 'asc'
                          ? 'ascending'
                          : sortState.direction === 'desc'
                            ? 'descending'
                            : 'none'
                        : undefined
                    }
                  >
                    <span>{col.label}</span>
                    {col.sortable &&
                      (() => {
                        const isAsc = sortState.key === col.key && sortState.direction === 'asc';
                        const isDesc = sortState.key === col.key && sortState.direction === 'desc';
                        const isUnsorted = !isAsc && !isDesc;
                        return (
                          <span className={`dt-sort-icon${isUnsorted ? ' unsorted' : ''}`}>
                            {isAsc && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m5 12 7-7 7 7" />
                              </svg>
                            )}
                            {isDesc && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m19 12-7 7-7-7" />
                              </svg>
                            )}
                            {isUnsorted && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m7 9 5-5 5 5" />
                                <path d="m7 15 5 5 5-5" />
                              </svg>
                            )}
                          </span>
                        );
                      })()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, ri) => (
                  <tr key={ri} className="dt-skeleton-row">
                    {columns.map((_, ci) => (
                      <td key={ci}>
                        <div className="dt-skeleton-cell" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dt-empty">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, ri) => (
                  <tr key={ri}>
                    {columns.map((col) => {
                      const val = row[col.key];
                      const content: ReactNode = React.isValidElement(val)
                        ? val
                        : val != null
                          ? String(val)
                          : '';
                      return (
                        <td key={col.key} className="dt-td">
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {onPageChange && totalPages != null && totalPages > 1 && page != null && (
          <div className="dt-pagination">
            <span className="dt-pagination-info">
              {totalItems != null ? `${totalItems} items` : ''} Page {page} of {totalPages}
            </span>
            <div className="dt-pagination-controls">
              <button
                className="dt-page-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(1)}
                aria-label="First page"
              >
                «
              </button>
              <button
                className="dt-page-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`e${i}`} className="dt-page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`dt-page-btn${p === page ? ' active' : ''}`}
                      onClick={() => onPageChange(p as number)}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                className="dt-page-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
              >
                ›
              </button>
              <button
                className="dt-page-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(totalPages)}
                aria-label="Last page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
