'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import DataTable from '@/components/common/data-table';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';

interface FilterOption {
  value: number;
  label: string;
}

export default function PresensiPage() {
  const { callApi, loading } = useApi();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({
    search: '',
    bulan: { value: new Date().getMonth() + 1, label: new Date().toLocaleString('id-ID', { month: 'long' }) } as SingleValue<FilterOption>,
    tahun: { value: new Date().getFullYear(), label: new Date().getFullYear().toString() } as SingleValue<FilterOption>,
  });

  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchData = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: filters.search,
        bulan: filters.bulan?.value.toString() || '',
        tahun: filters.tahun?.value.toString() || '',
      });

      const res = await callApi(`/api/presensi?${query}`);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const query = new URLSearchParams({
        search: filters.search,
        bulan: filters.bulan?.value.toString() || '',
        tahun: filters.tahun?.value.toString() || '',
      });
      
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/presensi/export?${query}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data_presensi_${filters.bulan?.value}_${filters.tahun?.value}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Gagal mengekspor data');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekspor data');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      await callApi('/api/presensi/import', {
        method: 'POST',
        body: formData,
      });

      setShowImport(false);
      setImportFile(null);
      fetchData(1);
      alert('Presensi berhasil diimport');
    } catch (err: any) {
      alert(err.message || 'Gagal mengimport presensi');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/presensi/template', '_blank');
  };

  useEffect(() => {
    fetchData(1);
  }, [filters.search, filters.bulan, filters.tahun]);

  const columns = [
    { key: 'no', label: 'No', render: (row: any, idx: number) => (meta.page - 1) * meta.limit + idx + 1 },
    { 
      key: 'tanggal', 
      label: 'Tanggal', 
      render: (row: any) => new Date(row.tanggal).toLocaleDateString('id-ID') 
    },
    { key: 'nama', label: 'Nama Pegawai', render: (row: any) => row.pegawai?.nama || '-' },
    { 
      key: 'waktuCheckin', 
      label: 'Check-in', 
      render: (row: any) => row.waktuCheckin ? new Date(row.waktuCheckin).toLocaleTimeString('id-ID') : '-' 
    },
    { 
      key: 'waktuCheckout', 
      label: 'Check-out', 
      render: (row: any) => row.waktuCheckout ? new Date(row.waktuCheckout).toLocaleTimeString('id-ID') : '-' 
    },
    { 
      key: 'statusKehadiran', 
      label: 'Status', 
      render: (row: any) => {
        const variants: any = {
          HADIR: 'success',
          CUTI: 'info',
          IZIN: 'warning',
          UNPAID_LEAVE: 'danger',
        };
        return <Badge bg={variants[row.statusKehadiran] || 'secondary'}>{row.statusKehadiran}</Badge>;
      }
    },
    {
      key: 'verifikasi',
      label: 'Verifikasi',
      render: (row: any) => (
        <Badge bg={row.verifikasi === 'DISETUJUI' ? 'success' : row.verifikasi === 'DITOLAK' ? 'danger' : 'warning'}>
          {row.verifikasi}
        </Badge>
      )
    },
  ];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Data Presensi</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleExport}>
            <i className="bi bi-file-earmark-excel me-2"></i>Export Excel
          </Button>
          <Button variant="primary" onClick={() => setShowImport(true)}>
            <i className="bi bi-cloud-upload me-2"></i>Import Presensi
          </Button>
        </div>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Cari nama pegawai..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Select
                placeholder="Bulan"
                options={[
                  { value: 1, label: 'Januari' },
                  { value: 2, label: 'Februari' },
                  { value: 3, label: 'Maret' },
                  { value: 4, label: 'April' },
                  { value: 5, label: 'Mei' },
                  { value: 6, label: 'Juni' },
                  { value: 7, label: 'Juli' },
                  { value: 8, label: 'Agustus' },
                  { value: 9, label: 'September' },
                  { value: 10, label: 'Oktober' },
                  { value: 11, label: 'November' },
                  { value: 12, label: 'Desember' },
                ]}
                value={filters.bulan}
                onChange={(val) => setFilters({ ...filters, bulan: val })}
              />
            </Col>
            <Col md={3}>
              <Select
                placeholder="Tahun"
                options={[2024, 2025, 2026].map(y => ({ value: y, label: y.toString() }))}
                value={filters.tahun}
                onChange={(val) => setFilters({ ...filters, tahun: val })}
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

      {/* Import Modal */}
      <div className={`modal fade ${showImport ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Import Data Presensi</h5>
              <button type="button" className="btn-close" onClick={() => setShowImport(false)}></button>
            </div>
            <Form onSubmit={handleImport}>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="text-muted small">
                    Silahkan download template excel terlebih dahulu untuk menyesuaikan format data.
                  </p>
                  <Button variant="light" size="sm" className="mb-3" onClick={downloadTemplate}>
                    <i className="bi bi-download me-2"></i>Download Template
                  </Button>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Pilih File Excel (.xlsx)</Form.Label>
                    <Form.Control 
                      type="file" 
                      accept=".xlsx" 
                      onChange={(e: any) => setImportFile(e.target.files[0])}
                      required
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="modal-footer border-0">
                <Button variant="light" onClick={() => setShowImport(false)} disabled={importing}>
                  Batal
                </Button>
                <Button variant="primary" type="submit" disabled={importing || !importFile}>
                  {importing ? 'Mengimport...' : 'Import Sekarang'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
