'use client';

import PegawaiForm from '@/components/pegawai/pegawai-form';
import { Card, Container } from 'react-bootstrap';

export default function TambahPegawaiPage() {
  return (
    <Container className="py-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Tambah Pegawai Baru</h4>
        <p className="text-muted small">Lengkapi formulir di bawah untuk menambahkan data pegawai baru.</p>
      </div>
      
      <PegawaiForm />
    </Container>
  );
}
