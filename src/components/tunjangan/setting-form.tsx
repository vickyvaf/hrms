'use client';

import { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useApi } from '@/hooks/use-api';

interface SettingFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export default function SettingForm({ initialData, onSuccess }: SettingFormProps) {
  const { callApi, loading } = useApi();
  const [formData, setFormData] = useState({
    baseFare: initialData?.baseFare || '',
    keterangan: initialData?.keterangan || '',
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callApi('/api/tunjangan/setting', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      onSuccess();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Tarif Dasar (Per Km)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Contoh: 2500"
                  value={formData.baseFare}
                  onChange={(e) => setFormData({ ...formData, baseFare: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Keterangan</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Keterangan setting..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Check
                type="switch"
                id="isActive"
                label="Aktifkan setting ini (Akan menonaktifkan setting lain)"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Col>
            <Col md={12} className="text-end mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}
