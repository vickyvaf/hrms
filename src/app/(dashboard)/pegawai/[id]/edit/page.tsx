'use client';

import PegawaiForm from '@/components/pegawai/pegawai-form';
import { useApi } from '@/hooks/use-api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';

export default function EditPegawaiPage() {
  const { id } = useParams();
  const { callApi, loading, error } = useApi();
  const [pegawai, setPegawai] = useState<any>(null);

  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const res = await callApi(`/api/pegawai/${id}`);
        if (res.success) {
          // Convert date strings back to Date objects for the form
          const data = {
            ...res.data,
            tanggalLahir: res.data.tanggalLahir ? new Date(res.data.tanggalLahir) : null,
            tanggalMasuk: res.data.tanggalMasuk ? new Date(res.data.tanggalMasuk) : null,
          };
          setPegawai(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPegawai();
  }, [id, callApi]);

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
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Edit Data Pegawai</h4>
        <p className="text-muted small">Perbarui informasi untuk pegawai: {pegawai.nama}</p>
      </div>
      
      <PegawaiForm initialData={pegawai} isEdit={true} />
    </Container>
  );
}
