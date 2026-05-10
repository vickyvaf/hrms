'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import DataTable from '@/components/common/data-table';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Select, { SingleValue } from 'react-select';
import ConfirmModal from '@/components/common/confirm-modal';
import AlertToast from '@/components/common/alert-toast';


interface FilterOption {
  value: number;
  label: string;
}

export default function TunjanganPage() {
  const router = useRouter();
  const { callApi, loading } = useApi();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, limit: 10 });
  const [calculating, setCalculating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' as any });

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [filters, setFilters] = useState({
    search: '',
    bulan: { value: lastMonth.getMonth() + 1, label: lastMonth.toLocaleString('id-ID', { month: 'long' }) } as SingleValue<FilterOption>,
    tahun: { value: lastMonth.getFullYear(), label: lastMonth.getFullYear().toString() } as SingleValue<FilterOption>,
  });


  const fetchData = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: filters.search,
        bulan: filters.bulan?.value.toString() || '',
        tahun: filters.tahun?.value.toString() || '',
      });

      const res = await callApi(`/api/tunjangan?${query}`);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculate = async () => {
    if (!filters.bulan || !filters.tahun) return;
    
    setCalculating(true);
    try {
      await callApi('/api/tunjangan/calculate', {
        method: 'POST',
        body: JSON.stringify({
          bulan: filters.bulan.value,
          tahun: filters.tahun.value,
        }),
      });
      setToast({ show: true, message: 'Berhasil menghitung tunjangan', variant: 'success' });
      fetchData(1);
    } catch (err: any) {
      setToast({ show: true, message: err.message || 'Gagal menghitung tunjangan', variant: 'danger' });
    } finally {
      setCalculating(false);
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters.search, filters.bulan, filters.tahun]);

  const columns = [
    { key: 'no', label: 'No', render: (row: any, idx: number) => (meta.page - 1) * meta.limit + idx + 1 },
    { key: 'nama', label: 'Nama Pegawai', render: (row: any) => row.pegawai?.nama || '-' },
    { 
      key: 'periode', 
      label: 'Periode', 
      render: (row: any) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${months[row.bulan - 1]} ${row.tahun}`;
      }
    },
    { 
      key: 'jarakKm', 
      label: 'Jarak (Km)', 
      render: (row: any) => `${parseFloat(row.jarakKm).toFixed(2)} Km` 
    },
    { 
      key: 'jumlahHariMasuk', 
      label: 'Hari Masuk', 
      render: (row: any) => `${row.jumlahHariMasuk} Hari` 
    },
    { 
      key: 'totalTunjangan', 
      label: 'Total Tunjangan', 
      render: (row: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.totalTunjangan)
    },
  ];

  return (
    <div className="fade-in">
      <AlertToast 
        show={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
        message={toast.message} 
        variant={toast.variant} 
      />

      <ConfirmModal 
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={handleCalculate}
        title="Hitung Tunjangan"
        message={`Apakah Anda yakin ingin menghitung tunjangan untuk periode ${filters.bulan?.label} ${filters.tahun?.value}? Data lama pada periode ini akan diperbarui.`}
        confirmText="Hitung Sekarang"
        confirmVariant="primary"
        loading={calculating}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Tunjangan Transport</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => router.push('/tunjangan/setting')}>
            <i className="bi bi-gear-fill me-2"></i>Pengaturan
          </Button>
          <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={calculating}>
            <i className="bi bi-calculator me-2"></i>
            {calculating ? 'Menghitung...' : 'Hitung Tunjangan'}
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
    </div>
  );
}
