'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useApi } from '@/hooks/use-api';
import WidgetCard from '@/components/dashboard/widget-card';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Card, Spinner, Table, Alert } from 'react-bootstrap';

const MapDomisili = dynamic(() => import('@/components/dashboard/map-domisili'), { 
  ssr: false,
  loading: () => <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '400px' }}>Loading Map...</div>
});

const DoughnutChart = dynamic(() => import('@/components/dashboard/doughnut-chart'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const { callApi, loading } = useApi();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callApi('/api/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h4 className="fw-bold mb-1">Dashboard Overview</h4>
          <p className="text-muted mb-0">
            Welcome back, <span className="text-primary fw-medium">{user?.nama || user?.username || 'User'}</span>
          </p>
        </div>
        <div className="text-end d-none d-md-block">
          <div className="small text-muted">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <WidgetCard title="Total Pegawai" value={data.stats.total} icon="bi-people" color="primary" />
        </Col>
        <Col md={3}>
          <WidgetCard title="Total Kontrak" value={data.stats.kontrak} icon="bi-file-earmark-text" color="info" />
        </Col>
        <Col md={3}>
          <WidgetCard title="Total Tetap" value={data.stats.tetap} icon="bi-shield-check" color="success" />
        </Col>
        <Col md={3}>
          <WidgetCard title="Total Magang" value={data.stats.magang} icon="bi-mortarboard" color="warning" />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h6" className="fw-bold mb-4">Jenis Pegawai</Card.Title>
              <div style={{ height: '250px' }}>
                <DoughnutChart 
                  labels={['Tetap', 'Kontrak', 'Magang']}
                  data={[data.stats.tetap, data.stats.kontrak, data.stats.magang]}
                  colors={['#10b981', '#3b82f6', '#f59e0b']}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h6" className="fw-bold mb-4">Gender Distribution</Card.Title>
              <div style={{ height: '250px' }}>
                <DoughnutChart 
                  labels={['Pria', 'Wanita']}
                  data={[data.stats.pria, data.stats.wanita]}
                  colors={['#2563eb', '#ec4899']}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h6" className="fw-bold mb-3">Pegawai Baru</Card.Title>
              <Table responsive size="sm" className="small">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Jabatan</th>
                    <th>Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPegawai.map((p: any) => (
                    <tr key={p.id}>
                      <td>{p.nama}</td>
                      <td>{p.jabatan}</td>
                      <td>{new Date(p.tanggalMasuk).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-none">
            <Card.Body className="p-0">
              <div className="p-3 border-bottom d-flex align-items-center">
                <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                <Card.Title as="h6" className="fw-bold mb-0">Peta Domisili Pegawai</Card.Title>
              </div>
              <div className="p-3">
                <MapDomisili 
                  pegawai={data.mapData} 
                  officeCoord={[-7.7956, 110.3695]} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
