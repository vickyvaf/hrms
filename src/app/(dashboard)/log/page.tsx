'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import DataTable from '@/components/common/data-table';
import { Container, Row, Col, Card, Form, Badge, Alert } from 'react-bootstrap';
import Select from 'react-select';

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: '6px',
    padding: '0.2rem 0.4rem',
    borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#2563eb',
    }
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? 'rgba(37, 99, 235, 0.1)' : 'white',
    color: state.isSelected ? 'white' : '#0f172a',
    '&:active': {
      backgroundColor: '#2563eb',
    }
  })
};

export default function LogPage() {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, limit: 20 });
  const [filters, setFilters] = useState({
    search: '',
    modul: null as any,
    aksi: null as any,
  });

  const fetchData = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: meta.limit.toString(),
        search: filters.search,
        ...(filters.modul ? { moduls: filters.modul.value } : {}),
        ...(filters.aksi ? { aksi: filters.aksi.value } : {}),
      });

      const res = await callApi(`/api/log?${query}`);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters.search, filters.modul, filters.aksi]);

  const columns = [
    { key: 'no', label: 'No', render: (row: any, idx: number) => (meta.page - 1) * meta.limit + idx + 1 },
    {
      key: 'createdAt',
      label: 'Waktu',
      render: (row: any) => new Date(row.createdAt).toLocaleString('id-ID')
    },
    { key: 'username', label: 'User' },
    {
      key: 'modul',
      label: 'Modul',
      render: (row: any) => <Badge bg="secondary">{row.modul}</Badge>
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row: any) => {
        const variants: any = {
          CREATE: 'success',
          UPDATE: 'primary',
          DELETE: 'danger',
          LOGIN: 'info',
          LOGOUT: 'warning',
        };
        return <Badge bg={variants[row.aksi] || 'dark'}>{row.aksi}</Badge>;
      }
    },
    { key: 'deskripsi', label: 'Deskripsi' },
    { key: 'ipAddress', label: 'IP Address', render: (row: any) => row.ipAddress || '-' },
  ];

  return (
    <div className="fade-in">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Log Aktivitas</h4>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Cari deskripsi..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Select
                isClearable
                placeholder="Pilih Modul"
                styles={selectStyles}
                options={[
                  { value: 'LOGIN', label: 'Login' },
                  { value: 'USER', label: 'User' },
                  { value: 'PEGAWAI', label: 'Pegawai' },
                  { value: 'PRESENSI', label: 'Presensi' },
                  { value: 'TUNJANGAN', label: 'Tunjangan' },
                ]}
                value={filters.modul}
                onChange={(val) => setFilters({ ...filters, modul: val })}
              />
            </Col>
            <Col md={3}>
              <Select
                isClearable
                placeholder="Pilih Aksi"
                styles={selectStyles}
                options={[
                  { value: 'CREATE', label: 'Create' },
                  { value: 'UPDATE', label: 'Update' },
                  { value: 'DELETE', label: 'Delete' },
                  { value: 'LOGIN', label: 'Login' },
                  { value: 'LOGOUT', label: 'Logout' },
                ]}
                value={filters.aksi}
                onChange={(val) => setFilters({ ...filters, aksi: val })}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          currentPage: meta.page,
          totalPages: Math.ceil(meta.total / meta.limit),
          onPageChange: fetchData,
        }}
      />
    </div>
  );
}
