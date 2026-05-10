'use client';

import ConfirmModal from '@/components/common/confirm-modal';
import DataTable from '@/components/common/data-table';
import { useApi } from '@/hooks/use-api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import Select from 'react-select';

export default function PegawaiPage() {
  const { callApi, loading, error, setError } = useApi();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, limit: 10 });
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    jabatan: [],
    jenis: [],
    masaKerjaOp: '>',
    masaKerjaVal: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: filters.search,
        jabatan: filters.jabatan.map((j: any) => j.value).join(','),
        jenis: filters.jenis.map((j: any) => j.value).join(','),
        masaKerjaOp: filters.masaKerjaOp,
        masaKerjaVal: filters.masaKerjaVal,
      });

      const res = await callApi(`/api/pegawai?${query}`);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters.search, filters.jabatan, filters.jenis, filters.masaKerjaOp, filters.masaKerjaVal]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const columns = [
    { key: 'no', label: 'No', render: (row: any, idx: number) => (meta.page - 1) * meta.limit + idx + 1 },
    { key: 'nip', label: 'NIP' },
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'tanggalMasuk', label: 'Tgl Masuk', render: (row: any) => new Date(row.tanggalMasuk).toLocaleDateString() },
    { key: 'masaKerja', label: 'Masa Kerja', render: (row: any) => `${row.masaKerja} Thn` },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row: any) => (
        <div className="d-flex gap-1">
          <Button as={Link as any} href={`/pegawai/${row.id}`} variant="outline-info" size="sm" title="Detail">
            <i className="bi bi-eye"></i>
          </Button>
          <Button as={Link as any} href={`/pegawai/${row.id}/edit`} variant="outline-primary" size="sm" title="Edit">
            <i className="bi bi-pencil"></i>
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            title="Hapus"
            onClick={() => handleDeleteClick(row.id)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      ),
    },
  ];

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setIsBulkDelete(false);
    setShowDeleteConfirm(true);
  };

  const handleBulkDeleteClick = () => {
    setIsBulkDelete(true);
    setShowDeleteConfirm(true);
  };

  const handleDownloadPdf = async (id?: string) => {
    try {
      const url = id ? `/api/pegawai/${id}/download-pdf` : '/api/pegawai/download-pdf';
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = id ? `pegawai-${id}.pdf` : 'daftar-pegawai.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setError('Gagal mendownload PDF');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mendownload PDF');
    }
  };

  const handleBulkStatusUpdate = async (status: boolean) => {
    try {
      await callApi('/api/pegawai/bulk-status', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, isActive: status }),
      });
      setSuccess(`${selectedIds.length} pegawai berhasil di${status ? 'aktifkan' : 'nonaktifkan'}`);
      setSelectedIds([]);
      fetchData(meta.page);
    } catch (err) {
      // Error handled by useApi
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      if (isBulkDelete) {
        await callApi('/api/pegawai/bulk-delete', {
          method: 'POST',
          body: JSON.stringify({ ids: selectedIds }),
        });
        setSuccess(`${selectedIds.length} pegawai berhasil dihapus`);
        setSelectedIds([]);
      } else if (idToDelete) {
        await callApi(`/api/pegawai/${idToDelete}`, { method: 'DELETE' });
        setSuccess('Pegawai berhasil dihapus');
      }
      setShowDeleteConfirm(false);
      fetchData(meta.page);
    } catch (err) {
      // Error handled by useApi
    } finally {
      setDeleteLoading(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Daftar Pegawai</h4>
        <div className="d-flex gap-2">
          <Button as={Link as any} href="/pegawai/tambah" variant="primary">
            <i className="bi bi-plus-lg me-2"></i>Data Baru
          </Button>
          <Button variant="outline-secondary" onClick={() => handleDownloadPdf()}>
            <i className="bi bi-file-earmark-pdf me-2"></i>Download PDF
          </Button>
        </div>
      </div>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4 border-0 shadow-sm">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4 border-0 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Cari Nama / NIP / Jabatan..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Select
                isMulti
                placeholder="Filter Jabatan"
                options={[
                  { value: 'MANAGER', label: 'Manager' },
                  { value: 'STAF', label: 'Staf' },
                  { value: 'MAGANG', label: 'Magang' },
                  { value: 'KARYAWAN', label: 'Karyawan' },
                ]}
                onChange={(val: any) => setFilters({ ...filters, jabatan: val })}
              />
            </Col>
            <Col md={3}>
              <Select
                isMulti
                placeholder="Filter Jenis"
                options={[
                  { value: 'KONTRAK', label: 'Kontrak' },
                  { value: 'TETAP', label: 'Tetap' },
                  { value: 'MAGANG', label: 'Magang' },
                ]}
                onChange={(val: any) => setFilters({ ...filters, jenis: val })}
              />
            </Col>
            <Col md={2}>
              <InputGroup>
                <Form.Select
                  style={{ maxWidth: '70px' }}
                  value={filters.masaKerjaOp}
                  onChange={(e) => setFilters({ ...filters, masaKerjaOp: e.target.value })}
                >
                  <option value=">">{'>'}</option>
                  <option value="=">=</option>
                  <option value="<">{'<'}</option>
                </Form.Select>
                <Form.Control
                  type="number"
                  placeholder="Thn"
                  value={filters.masaKerjaVal}
                  onChange={(e) => setFilters({ ...filters, masaKerjaVal: e.target.value })}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {selectedIds.length > 0 && (
        <Alert variant="primary" className="py-2 d-flex justify-content-between align-items-center mb-3">
          <span>{selectedIds.length} data terpilih</span>
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" onClick={() => handleBulkStatusUpdate(true)}>
              Aktifkan
            </Button>
            <Button variant="warning" size="sm" onClick={() => handleBulkStatusUpdate(false)}>
              Nonaktifkan
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDeleteClick}>
              Hapus Terpilih
            </Button>
          </div>
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pagination={{
          currentPage: meta.page,
          totalPages: Math.ceil(meta.total / meta.limit),
          onPageChange: fetchData,
        }}
      />
      <ConfirmModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={isBulkDelete ? 'Hapus Terpilih' : 'Hapus Pegawai'}
        message={isBulkDelete
          ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} pegawai yang dipilih?`
          : 'Apakah Anda yakin ingin menghapus data pegawai ini?'}
      />
    </div>
  );
}
