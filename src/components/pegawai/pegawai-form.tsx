'use client';

import { useReducer, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Form, Button, Card, Row, Col, Image, InputGroup, FormCheck } from 'react-bootstrap';

interface PegawaiState {
  nip: string;
  nama: string;
  email: string;
  nomorHp: string;
  jabatan: string;
  departemen: string;
  jenisPegawai: string;
  gender: string;
  statusKawin: string;
  jumlahAnak: string;
  tanggalLahir: Date | null;
  tempatLahirId: string | null;
  tempatLahirNama: string;
  tanggalMasuk: Date | null;
  provinsi: string;
  kabupatenNama: string;
  kecamatanId: string | null;
  kecamatanNama: string;
  kalurahanId: string | null;
  kalurahanNama: string;
  alamatDetail: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
  pendidikan: any[];
  foto: File | null;
  fotoPreview: string | null;
  errors: Record<string, string>;
}

const initialState: PegawaiState = {
  nip: '',
  nama: '',
  email: '',
  nomorHp: '',
  jabatan: 'STAF',
  departemen: 'PRODUCTION',
  jenisPegawai: 'KONTRAK',
  gender: 'PRIA',
  statusKawin: 'TIDAK_KAWIN',
  jumlahAnak: '',
  tanggalLahir: null,
  tempatLahirId: null,
  tempatLahirNama: '',
  tanggalMasuk: null,
  provinsi: '',
  kabupatenNama: '',
  kecamatanId: null,
  kecamatanNama: '',
  kalurahanId: null,
  kalurahanNama: '',
  alamatDetail: '',
  latitude: '',
  longitude: '',
  isActive: true,
  pendidikan: [{ jenjang: '', institusi: '', jurusan: '', tahunLulus: '' }],
  foto: null,
  fotoPreview: null,
  errors: {},
};

function formReducer(state: PegawaiState, action: any): PegawaiState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return { ...state, errors: newErrors };
    case 'SET_REGION':
      return { 
        ...state, 
        kecamatanId: action.kecamatanId,
        kecamatanNama: action.kecamatanNama,
        kabupatenNama: action.kabupatenNama,
        provinsi: action.provinsiNama
      };
    case 'ADD_PENDIDIKAN':
      return { ...state, pendidikan: [...state.pendidikan, { jenjang: '', institusi: '', jurusan: '', tahunLulus: '' }] };
    case 'REMOVE_PENDIDIKAN':
      return { ...state, pendidikan: state.pendidikan.filter((_, i) => i !== action.index) };
    case 'UPDATE_PENDIDIKAN':
      const newPendidikan = [...state.pendidikan];
      newPendidikan[action.index] = { ...newPendidikan[action.index], [action.field]: action.value };
      return { ...state, pendidikan: newPendidikan };
    default:
      return state;
  }
}

export default function PegawaiForm({ initialData, isEdit }: { initialData?: any, isEdit?: boolean }) {
  const [state, dispatch] = useReducer(formReducer, initialData ? { 
    ...initialData, 
    latitude: initialData.latitude ?? '',
    longitude: initialData.longitude ?? '',
    alamatDetail: initialData.alamatDetail ?? '',
    nip: initialData.nip ?? '',
    nama: initialData.nama ?? '',
    email: initialData.email ?? '',
    nomorHp: initialData.nomorHp ?? '',
    jumlahAnak: initialData.jumlahAnak?.toString() ?? '',
    tempatLahirNama: initialData.tempatLahirNama ?? '',
    kecamatanNama: initialData.kecamatanNama ?? '',
    kalurahanNama: initialData.kalurahanNama ?? '',
    errors: {}, 
    foto: null, 
    fotoPreview: initialData.fotoUrl 
  } : initialState);
  const { callApi, loading } = useApi();
  const router = useRouter();
  const [kalurahanOptions, setKalurahanOptions] = useState([]);

  // Calculate Age
  const usia = useMemo(() => {
    if (!state.tanggalLahir) return '';
    const today = new Date();
    const birthDate = new Date(state.tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [state.tanggalLahir]);

  // Validation Logic
  const validate = (field: string, value: any) => {
    let error = '';
    switch (field) {
      case 'nip':
        if (!/^\d{8,}$/.test(value)) error = 'NIP minimal 8 karakter angka';
        break;
      case 'nama':
        if (!/^[a-zA-Z0-9' ]+$/.test(value)) error = 'Nama hanya boleh huruf, angka, tanda petik, dan spasi';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Format email tidak valid';
        break;
      case 'nomorHp':
        if (!/^\+\d{10,15}$/.test(value)) error = 'Format internasional wajib (e.g. +62...)';
        break;
      case 'latitude':
        if (value && (value < -90 || value > 90)) error = 'Range -90 sampai 90';
        break;
      case 'longitude':
        if (value && (value < -180 || value > 180)) error = 'Range -180 sampai 180';
        break;
      case 'jumlahAnak':
        if (value < 0 || value > 99) error = 'Min 0, Max 99';
        break;
    }

    if (error) {
      dispatch({ type: 'SET_ERROR', field, error });
    } else {
      dispatch({ type: 'CLEAR_ERROR', field });
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    let finalValue = value;
    if (field === 'jumlahAnak' && value !== '') {
      finalValue = parseInt(value).toString();
    }
    dispatch({ type: 'SET_FIELD', field, value: finalValue });
    validate(field, finalValue);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch({ type: 'SET_FIELD', field: 'foto', value: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({ type: 'SET_FIELD', field: 'fotoPreview', value: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const loadKecamatan = async (inputValue: string) => {
    if (inputValue.length < 2) return [];
    try {
      const res = await fetch(`/api/wilayah/kecamatan?search=${inputValue}`);
      const result = await res.json();
      return result.data.map((k: any) => ({ value: k.id, label: k.label, raw: k }));
    } catch (err) {
      return [];
    }
  };

  const loadTempatLahir = async (inputValue: string) => {
    if (inputValue.length < 2) return [];
    try {
      const res = await fetch(`/api/wilayah/kabupaten?search=${inputValue}`);
      const result = await res.json();
      return result.data.map((k: any) => ({ value: k.id, label: k.nama }));
    } catch (err) {
      return [];
    }
  };

  const loadKalurahan = async (kecId: string) => {
    try {
      const res = await fetch(`/api/wilayah/kalurahan?kecamatanId=${kecId}`);
      const result = await res.json();
      setKalurahanOptions(result.data.map((k: any) => ({ value: k.id, label: k.nama })));
    } catch (err) {
      setKalurahanOptions([]);
    }
  };

  useEffect(() => {
    if (state.kecamatanId) {
      loadKalurahan(state.kecamatanId);
    }
  }, [state.kecamatanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(state.errors).length > 0) {
      alert('Terdapat kesalahan pada input form');
      return;
    }

    try {
      const formData = new FormData();
      (Object.keys(state) as Array<keyof PegawaiState>).forEach(key => {
        if (key === 'pendidikan') {
          formData.append(key, JSON.stringify(state[key]));
        } else if (key === 'foto') {
          if (state[key]) formData.append(key, state[key] as File);
        } else if (key === 'tanggalLahir' || key === 'tanggalMasuk') {
          formData.append(key, (state[key] as Date | null)?.toISOString() || '');
        } else if (key !== 'errors' && key !== 'fotoPreview') {
          formData.append(key, String(state[key] ?? ''));
        }
      });

      const url = isEdit ? `/api/pegawai/${initialData.id}` : '/api/pegawai';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await callApi(url, {
        method,
        body: formData as any,
      });

      if (res.success) {
        router.push('/pegawai');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="fade-in">
      <Row className="g-4">
        {/* Profile Card */}
        <Col md={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '2rem' }}>
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <div className="position-relative d-inline-block">
                  {state.fotoPreview ? (
                    <Image 
                      src={state.fotoPreview} 
                      roundedCircle
                      className="mb-3 shadow-sm border p-1"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      alt="Avatar" 
                    />
                  ) : (
                    <div 
                      className="mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center shadow-sm border p-1 bg-light text-secondary"
                      style={{ width: '150px', height: '150px', fontSize: '4rem' }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                  )}
                  <label 
                    htmlFor="foto-upload" 
                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow" 
                    style={{ marginBottom: '20px', width: '40px', height: '40px' }}
                  >
                    <i className="bi bi-camera"></i>
                  </label>
                </div>
                <Form.Control 
                  id="foto-upload"
                  type="file" 
                  className="d-none"
                  onChange={handleFotoChange}
                  accept="image/*"
                />
                <div className="text-muted small mb-3">Format: JPG, JPEG, PNG. Maks 2MB.</div>
              </div>
              <Card.Title as="h5" className="fw-bold mb-1">{state.nama || 'Nama Pegawai'}</Card.Title>
              <Card.Text className="text-muted small mb-4">{state.nip || 'NIP Pegawai'}</Card.Text>
              
              <div className="d-grid gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</>
                  ) : (
                    <><i className="bi bi-save me-2"></i>Simpan Data</>
                  )}
                </Button>
                <Button variant="light" size="sm" onClick={() => router.back()} disabled={loading}>Batal</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Form Content */}
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Informasi Pribadi</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">NIP <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!state.errors.nip}
                      value={state.nip}
                      onChange={(e) => handleFieldChange('nip', e.target.value)}
                      placeholder="Masukkan NIP"
                      required
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.nip}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Nama Lengkap <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!state.errors.nama}
                      value={state.nama}
                      onChange={(e) => handleFieldChange('nama', e.target.value)}
                      placeholder="Masukkan Nama Lengkap"
                      required
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.nama}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      isInvalid={!!state.errors.email}
                      value={state.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="contoh@perusahaan.com"
                      required
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Nomor HP <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!state.errors.nomorHp}
                      value={state.nomorHp}
                      onChange={(e) => handleFieldChange('nomorHp', e.target.value)}
                      placeholder="+62..."
                      required
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.nomorHp}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Tempat Lahir <span className="text-danger">*</span></Form.Label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={loadTempatLahir}
                      defaultOptions
                      placeholder="Cari Kota/Kabupaten..."
                      value={state.tempatLahirId ? { value: state.tempatLahirId, label: state.tempatLahirNama } : null}
                      onChange={(opt: any) => {
                        dispatch({ type: 'SET_FIELD', field: 'tempatLahirId', value: opt?.value });
                        dispatch({ type: 'SET_FIELD', field: 'tempatLahirNama', value: opt?.label });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold d-block">Tanggal Lahir <span className="text-danger">*</span></Form.Label>
                    <DatePicker
                      selected={state.tanggalLahir}
                      onChange={(date: Date | null) => handleFieldChange('tanggalLahir', date)}
                      className="form-control w-100"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      showYearDropdown
                      scrollableYearDropdown
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Usia (Otomatis)</Form.Label>
                    <Form.Control type="text" value={usia ? `${usia} Tahun` : ''} disabled className="bg-light" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold d-block">Gender <span className="text-danger">*</span></Form.Label>
                    <div className="mt-2">
                      <FormCheck 
                        inline 
                        type="radio" 
                        label="Pria" 
                        name="gender" 
                        id="gender-pria"
                        checked={state.gender === 'PRIA'}
                        onChange={() => handleFieldChange('gender', 'PRIA')}
                      />
                      <FormCheck 
                        inline 
                        type="radio" 
                        label="Wanita" 
                        name="gender" 
                        id="gender-wanita"
                        checked={state.gender === 'WANITA'}
                        onChange={() => handleFieldChange('gender', 'WANITA')}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold d-block">Status Kawin <span className="text-danger">*</span></Form.Label>
                    <div className="mt-2">
                      <FormCheck 
                        inline 
                        type="radio" 
                        label="Kawin" 
                        name="statusKawin" 
                        id="kawin"
                        checked={state.statusKawin === 'KAWIN'}
                        onChange={() => handleFieldChange('statusKawin', 'KAWIN')}
                      />
                      <FormCheck 
                        inline 
                        type="radio" 
                        label="Tidak" 
                        name="statusKawin" 
                        id="tidak-kawin"
                        checked={state.statusKawin === 'TIDAK_KAWIN'}
                        onChange={() => handleFieldChange('statusKawin', 'TIDAK_KAWIN')}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Jumlah Anak</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      max={99}
                      isInvalid={!!state.errors.jumlahAnak}
                      value={state.jumlahAnak}
                      onChange={(e) => handleFieldChange('jumlahAnak', e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.jumlahAnak}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Pekerjaan & Status</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Jabatan <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={state.jabatan} onChange={(e) => handleFieldChange('jabatan', e.target.value)} required>
                      <option value="MANAGER">Manager</option>
                      <option value="STAF">Staf</option>
                      <option value="MAGANG">Magang</option>
                      <option value="KARYAWAN">Karyawan</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Departemen <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={state.departemen} onChange={(e) => handleFieldChange('departemen', e.target.value)} required>
                      <option value="MARKETING">Marketing</option>
                      <option value="HRD">HRD</option>
                      <option value="PRODUCTION">Production</option>
                      <option value="EXECUTIVE">Executive</option>
                      <option value="COMMISSIONER">Commissioner</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Jenis Pegawai <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={state.jenisPegawai} onChange={(e) => handleFieldChange('jenisPegawai', e.target.value)} required>
                      <option value="KONTRAK">Kontrak</option>
                      <option value="TETAP">Tetap</option>
                      <option value="MAGANG">Magang</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold d-block">Tanggal Masuk <span className="text-danger">*</span></Form.Label>
                    <DatePicker
                      selected={state.tanggalMasuk}
                      onChange={(date: Date | null) => handleFieldChange('tanggalMasuk', date)}
                      className="form-control w-100"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-0">
                    <FormCheck 
                      type="switch"
                      id="status-aktif"
                      label="Pegawai Aktif"
                      checked={state.isActive}
                      onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                      className="fw-bold"
                    />
                    <small className="text-muted">Non-aktifkan pegawai untuk membatalkan akses sistem dan perhitungan gaji.</small>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Alamat & Lokasi</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Cari Kecamatan <span className="text-danger">*</span></Form.Label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={loadKecamatan}
                      defaultOptions
                      placeholder="Ketik minimal 2 karakter..."
                      value={state.kecamatanId ? { value: state.kecamatanId, label: state.kecamatanNama } : null}
                      onChange={(opt: any) => {
                        if (opt) {
                          dispatch({ 
                            type: 'SET_REGION', 
                            kecamatanId: opt.value, 
                            kecamatanNama: opt.raw.nama,
                            kabupatenNama: opt.raw.kabupatenNama,
                            provinsiNama: opt.raw.provinsiNama || 'DI Yogyakarta'
                          });
                        }
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Kalurahan <span className="text-danger">*</span></Form.Label>
                    <Select
                      options={kalurahanOptions}
                      placeholder="Pilih Kalurahan..."
                      value={state.kalurahanId ? { value: state.kalurahanId, label: state.kalurahanNama } : null}
                      onChange={(opt: any) => {
                        dispatch({ type: 'SET_FIELD', field: 'kalurahanId', value: opt?.value });
                        dispatch({ type: 'SET_FIELD', field: 'kalurahanNama', value: opt?.label });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Kabupaten</Form.Label>
                    <Form.Control type="text" className="bg-light" value={state.kabupatenNama} disabled />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Alamat Detail <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={state.alamatDetail}
                      onChange={(e) => handleFieldChange('alamatDetail', e.target.value)}
                      placeholder="Nama jalan, nomor rumah, RT/RW..."
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Latitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      isInvalid={!!state.errors.latitude}
                      value={state.latitude ?? ''}
                      onChange={(e) => handleFieldChange('latitude', e.target.value)}
                      placeholder="-7.7956"
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.latitude}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Longitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      isInvalid={!!state.errors.longitude}
                      value={state.longitude ?? ''}
                      onChange={(e) => handleFieldChange('longitude', e.target.value)}
                      placeholder="110.3695"
                    />
                    <Form.Control.Feedback type="invalid">{state.errors.longitude}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-5">
            <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Riwayat Pendidikan</h6>
              <Button variant="outline-primary" size="sm" onClick={() => dispatch({ type: 'ADD_PENDIDIKAN' })}>
                <i className="bi bi-plus-lg me-1"></i> Tambah Baris
              </Button>
            </Card.Header>
            <Card.Body className="pt-0">
              {state.pendidikan.map((edu, idx) => (
                <Row key={idx} className="g-2 mb-3 align-items-end">
                  <Col md={2}>
                    <Form.Control 
                      placeholder="Jenjang (e.g. S1)" 
                      size="sm"
                      value={edu.jenjang} 
                      onChange={(e) => dispatch({ type: 'UPDATE_PENDIDIKAN', index: idx, field: 'jenjang', value: e.target.value })}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control 
                      placeholder="Nama Institusi" 
                      size="sm"
                      value={edu.institusi} 
                      onChange={(e) => dispatch({ type: 'UPDATE_PENDIDIKAN', index: idx, field: 'institusi', value: e.target.value })}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control 
                      placeholder="Jurusan" 
                      size="sm"
                      value={edu.jurusan} 
                      onChange={(e) => dispatch({ type: 'UPDATE_PENDIDIKAN', index: idx, field: 'jurusan', value: e.target.value })}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control 
                      placeholder="Tahun" 
                      size="sm"
                      value={edu.tahunLulus} 
                      onChange={(e) => dispatch({ type: 'UPDATE_PENDIDIKAN', index: idx, field: 'tahunLulus', value: e.target.value })}
                    />
                  </Col>
                  <Col md={1}>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="w-100" 
                      onClick={() => dispatch({ type: 'REMOVE_PENDIDIKAN', index: idx })}
                      disabled={state.pendidikan.length === 1}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Form>
  );
}
