'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Alert } from 'react-bootstrap';
import { useApi } from '@/hooks/use-api';
import SettingForm from '@/components/tunjangan/setting-form';
import Link from 'next/link';


export default function TunjanganSettingPage() {
  const { callApi, loading } = useApi();
  const [settings, setSettings] = useState<any[]>([]);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' as any });

  const fetchSettings = async () => {
    try {
      const res = await callApi('/api/tunjangan/setting');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return; // Already active
    
    try {
      await callApi(`/api/tunjangan/setting/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });
      setAlert({ show: true, message: 'Pengaturan berhasil diaktifkan', variant: 'success' });
      fetchSettings();
    } catch (err: any) {
      setAlert({ show: true, message: err.message || 'Gagal mengaktifkan pengaturan', variant: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengaturan ini?')) return;

    try {
      await callApi(`/api/tunjangan/setting/${id}`, {
        method: 'DELETE',
      });
      setAlert({ show: true, message: 'Pengaturan berhasil dihapus', variant: 'success' });
      fetchSettings();
    } catch (err: any) {
      setAlert({ show: true, message: err.message || 'Gagal menghapus pengaturan', variant: 'danger' });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link href="/tunjangan" className="btn btn-link p-0 text-decoration-none mb-2">
            <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar
          </Link>
          <h4 className="fw-bold mb-0">Pengaturan Tunjangan Transport</h4>
        </div>
      </div>

      {alert.show && (
        <Alert 
          variant={alert.variant} 
          onClose={() => setAlert({ ...alert, show: false })} 
          dismissible
          className="shadow-sm border-0 mb-4"
        >
          <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2`}></i>
          {alert.message}
        </Alert>
      )}

      <Row>
        <Col lg={4}>
          <h5 className="mb-3">Tambah Pengaturan Baru</h5>
          <SettingForm onSuccess={() => {
            setAlert({ show: true, message: 'Pengaturan baru berhasil ditambahkan', variant: 'success' });
            fetchSettings();
          }} />
        </Col>

        <Col lg={8}>
          <h5 className="mb-3">Riwayat Pengaturan</h5>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Tarif Dasar</th>
                    <th className="py-3">Keterangan</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Tanggal</th>
                    <th className="py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">Belum ada data pengaturan</td>
                    </tr>
                  ) : (
                    settings.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3 fw-bold">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(s.baseFare)}
                        </td>
                        <td className="py-3">{s.keterangan || '-'}</td>
                        <td className="py-3">
                          <Badge bg={s.isActive ? 'success' : 'secondary'}>
                            {s.isActive ? 'Aktif' : 'Non-aktif'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {new Date(s.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 text-center">

                          <div className="d-flex justify-content-center gap-2">
                            {!s.isActive && (
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => handleToggleActive(s.id, s.isActive)}
                                title="Aktifkan"
                              >
                                <i className="bi bi-check-circle"></i>
                              </Button>
                            )}
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleDelete(s.id)}
                              disabled={s.isActive}
                              title={s.isActive ? "Tidak bisa menghapus pengaturan aktif" : "Hapus"}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

