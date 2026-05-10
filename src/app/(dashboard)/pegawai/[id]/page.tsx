'use client';

import { useApi } from '@/hooks/use-api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Image, Row, Spinner, Table } from 'react-bootstrap';
import Link from 'next/link';

export default function DetailPegawaiPage() {
  const { id } = useParams();
  const { callApi, loading, error } = useApi();
  const [pegawai, setPegawai] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const res = await callApi(`/api/pegawai/${id}`);
        if (res.success) {
          setPegawai(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPegawai();
  }, [id, callApi]);

  const handleDownloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pegawai/${id}/download-pdf`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pegawai-${pegawai.nip}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Failed to download PDF', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !pegawai) {
    return (
      <Container className="py-4 text-center">
        <h5 className="text-danger">Pegawai tidak ditemukan</h5>
        <Button variant="primary" onClick={() => router.back()}>Kembali</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Detail Pegawai</h4>
          <p className="text-muted small">Informasi lengkap data pegawai.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-2"></i>Kembali
          </Button>
          <Button as={Link as any} href={`/pegawai/${id}/edit`} variant="primary">
            <i className="bi bi-pencil me-2"></i>Edit Data
          </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-4">
            <Card.Body>
              {pegawai.fotoUrl ? (
                <Image
                  src={pegawai.fotoUrl}
                  roundedCircle
                  className="mb-3 shadow-sm border p-1"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  alt={pegawai.nama}
                />
              ) : (
                <div
                  className="mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center shadow-sm border p-1 bg-light text-secondary"
                  style={{ width: '150px', height: '150px', fontSize: '4rem' }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>
              )}
              <h5 className="fw-bold mb-1">{pegawai.nama}</h5>
              <p className="text-muted mb-3">{pegawai.nip}</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <Badge bg={pegawai.isActive ? 'success' : 'danger'} className="px-3 py-2">
                  {pegawai.isActive ? 'Aktif' : 'Non-aktif'}
                </Badge>
                <Badge bg="info" className="px-3 py-2">
                  {pegawai.jenisPegawai}
                </Badge>
              </div>
              <hr />
              <div className="text-start px-3">
                <div className="mb-2">
                  <small className="text-muted d-block">Jabatan</small>
                  <span className="fw-semibold">{pegawai.jabatan}</span>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Departemen</small>
                  <span className="fw-semibold">{pegawai.departemen}</span>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Tanggal Masuk</small>
                  <span className="fw-semibold">{new Date(pegawai.tanggalMasuk).toLocaleDateString('id-ID')}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Masa Kerja</small>
                  <span className="fw-semibold">{pegawai.masaKerja} Tahun</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Informasi Pribadi</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={6}>
                  <small className="text-muted d-block">Email</small>
                  <span className="fw-semibold">{pegawai.email}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Nomor HP</small>
                  <span className="fw-semibold">{pegawai.nomorHp}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Tempat, Tgl Lahir</small>
                  <span className="fw-semibold">{pegawai.tempatLahir?.nama || '-'}, {new Date(pegawai.tanggalLahir).toLocaleDateString('id-ID')}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Usia</small>
                  <span className="fw-semibold">{pegawai.usia} Tahun</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Gender</small>
                  <span className="fw-semibold">{pegawai.gender}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Status Kawin</small>
                  <span className="fw-semibold">{pegawai.statusKawin} ({pegawai.jumlahAnak} Anak)</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Alamat</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={12}>
                  <small className="text-muted d-block">Alamat Lengkap</small>
                  <span className="fw-semibold">{pegawai.alamatDetail}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Kalurahan, Kecamatan</small>
                  <span className="fw-semibold">{pegawai.kalurahan?.nama || '-'}, {pegawai.kecamatan?.nama || '-'}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Kabupaten, Provinsi</small>
                  <span className="fw-semibold">{pegawai.kabupatenNama}, {pegawai.provinsi}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Koordinat (Lat, Lng)</small>
                  <span className="fw-semibold">{pegawai.latitude}, {pegawai.longitude}</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Riwayat Pendidikan</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="small border-0">Jenjang</th>
                    <th className="small border-0">Institusi</th>
                    <th className="small border-0">Jurusan</th>
                    <th className="small border-0 text-center">Tahun Lulus</th>
                  </tr>
                </thead>
                <tbody>
                  {pegawai.pendidikan?.length > 0 ? (
                    pegawai.pendidikan.map((edu: any, idx: number) => (
                      <tr key={idx}>
                        <td>{edu.jenjang}</td>
                        <td>{edu.institusi}</td>
                        <td>{edu.jurusan}</td>
                        <td className="text-center">{edu.tahunLulus}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3 small">Tidak ada data pendidikan</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
