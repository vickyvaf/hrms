'use client';

import { Table, Form, Pagination as RBPagination, Spinner } from 'react-bootstrap';

interface Column {
  key: string;
  label: string;
  render?: (row: any, idx: number) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export default function DataTable({
  columns,
  data,
  loading,
  pagination,
  selectable,
  selectedIds = [],
  onSelectionChange,
}: DataTableProps) {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(data.map((item) => item.id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectOne = (id: string) => {
    if (onSelectionChange) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((i) => i !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  return (
    <div className="border rounded-3 overflow-hidden bg-white">
      <Table hover responsive className="align-middle mb-0">
        <thead className="bg-light">
          <tr>
            {selectable && (
              <th style={{ width: '40px' }}>
                <Form.Check
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={data.length > 0 && selectedIds.length === data.length}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-muted small fw-bold text-uppercase py-3"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-5">
                <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                Loading data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-5 text-muted">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {selectable && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectOne(row.id)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="small text-muted">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <RBPagination size="sm" className="mb-0">
            <RBPagination.Prev
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            />
            {(() => {
              const current = pagination.currentPage;
              const total = pagination.totalPages;
              const pages = [];
              
              if (total <= 7) {
                for (let i = 1; i <= total; i++) pages.push(i);
              } else {
                pages.push(1);
                
                if (current > 4) {
                  pages.push('ellipsis-start');
                }
                
                let start = Math.max(2, current - 1);
                let end = Math.min(total - 1, current + 1);
                
                if (current <= 4) {
                  end = 5;
                }
                
                if (current >= total - 3) {
                  start = total - 4;
                }
                
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                if (current < total - 3) {
                  pages.push('ellipsis-end');
                }
                
                pages.push(total);
              }
              
              return pages.map((p) => {
                if (p === 'ellipsis-start' || p === 'ellipsis-end') {
                  return <RBPagination.Ellipsis key={p} disabled />;
                }
                return (
                  <RBPagination.Item
                    key={p}
                    active={current === p}
                    onClick={() => pagination.onPageChange(p as number)}
                  >
                    {p}
                  </RBPagination.Item>
                );
              });
            })()}
            <RBPagination.Next
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            />
          </RBPagination>
        </div>
      )}
    </div>
  );
}
