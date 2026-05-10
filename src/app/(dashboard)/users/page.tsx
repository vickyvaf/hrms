'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import DataTable from '@/components/common/data-table';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Modal, InputGroup } from 'react-bootstrap';
import ConfirmModal from '@/components/common/confirm-modal';

export default function UsersPage() {
  const { user: authUser } = useAuth();
  const { callApi, loading, error, setError } = useApi();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({
    search: '',
    role: null as any,
  });
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);

  // Delete Confirm State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Post-Create Modal
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    pegawaiId: '',
    pegawaiName: '',
    pegawaiLabel: null as any,
    username: '',
    email: '',
    nomorHp: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN_HRD',
    isActive: true,
  });

  // Validation State
  const [errors, setErrors] = useState<any>({});
  const [checkingUsername, setCheckingUsername] = useState(false);

  const fetchData = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: filters.search,
        ...(filters.role ? { role: filters.role } : {}),
      });

      const res = await callApi(`/api/users?${query}`);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPegawaiList = async () => {
    try {
      const res = await callApi(`/api/pegawai?withoutUser=true&limit=100`);
      setPegawaiList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(1);
    fetchPegawaiList();
  }, [filters.search, filters.role]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handlePegawaiNameChange = (e: any) => {
    const name = e.target.value;
    // Find pegawai by name or label (name + nip)
    const pegawai = pegawaiList.find(p => p.nama === name || `${p.nama} (${p.nip})` === name);

    setFormData({
      ...formData,
      pegawaiName: name,
      pegawaiId: pegawai?.id || '',
      email: pegawai?.email || (pegawai ? '' : formData.email),
      nomorHp: pegawai?.nomorHp || (pegawai ? '' : formData.nomorHp),
    });

    if (pegawai) {
      setErrors({ ...errors, pegawaiId: null });
    }
  };

  // Username availability check
  useEffect(() => {
    if (!formData.username || formData.username.length < 6 || isEdit) return;

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await callApi(`/api/users/check-username?username=${formData.username}`);
        if (!res.data.available) {
          setErrors((prev: any) => ({ ...prev, username: 'Username sudah digunakan' }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, isEdit]);

  const validateUsername = (val: string) => {
    if (val.length < 6) return 'Username minimal 6 karakter';
    if (/\s/.test(val)) return 'Username tidak boleh ada spasi';
    if (!/^[a-z0-9]+$/.test(val)) return 'Username hanya boleh huruf kecil dan angka';
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val && isEdit) return null; // Password optional on edit
    if (val.length < 8) return 'Password minimal 8 karakter';
    if (/\s/.test(val)) return 'Password tidak boleh ada spasi';
    if (!/[A-Z]/.test(val)) return 'Password harus ada minimal 1 huruf besar';
    if (!/[a-z]/.test(val)) return 'Password harus ada minimal 1 huruf kecil';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) return 'Password harus ada minimal 1 karakter khusus';
    return null;
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData({ ...formData, [name]: val });

    // Real-time validation
    if (name === 'username') {
      setErrors({ ...errors, username: validateUsername(value) });
    } else if (name === 'password') {
      setErrors({ ...errors, password: validatePassword(value) });
    } else if (name === 'confirmPassword') {
      setErrors({
        ...errors,
        confirmPassword: value !== formData.password ? 'Password tidak cocok' : null
      });
    }
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    // Ensure at least one of each required type
    password += "A"; // Upper
    password += "a"; // Lower
    password += "1"; // Number
    password += "!"; // Special
    for (let i = 4; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Shuffle
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    setFormData({ ...formData, password, confirmPassword: password });
    setErrors({ ...errors, password: null, confirmPassword: null });
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setIsEdit(true);
      setSelectedUser(user);
      setFormData({
        pegawaiId: user.pegawaiId,
        pegawaiName: user.pegawai?.nama || user.nama || '',
        pegawaiLabel: null,
        password: '',
        confirmPassword: '',
        role: user.role,
        isActive: user.isActive,
        username: user.username,
        email: user.email,
        nomorHp: user.nomorHp,
      });
    } else {
      setIsEdit(false);
      setSelectedUser(null);
      setFormData({
        pegawaiId: '',
        pegawaiName: '',
        pegawaiLabel: null,
        username: '',
        email: '',
        nomorHp: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN_HRD',
        isActive: true,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Final Validation
    const newErrors: any = {};
    if (!formData.pegawaiId) newErrors.pegawaiId = 'Pegawai harus dipilih dari daftar';
    newErrors.username = validateUsername(formData.username);
    if (!isEdit || formData.password) {
      newErrors.password = validatePassword(formData.password);
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }

    if (Object.values(newErrors).some(v => v !== null)) {
      setErrors(newErrors);
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        pegawaiId: formData.pegawaiId || null,
        nama: formData.pegawaiName,
        username: formData.username,
        email: formData.email,
        nomorHp: formData.nomorHp,
        role: formData.role,
        isActive: formData.isActive,
        ...(formData.password ? { password: formData.password } : {}),
      };

      if (isEdit) {
        await callApi(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('User berhasil diperbarui');
      } else {
        const res = await callApi('/api/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setCreatedUser({ ...res.data, rawPassword: formData.password });
        setShowCreatedModal(true);
      }

      setShowModal(false);
      fetchData(meta.page);
    } catch (err: any) {
      // Error is handled by useApi and displayed in the UI
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;

    setDeleteLoading(true);
    try {
      await callApi(`/api/users/${idToDelete}`, { method: 'DELETE' });
      setSuccess('User berhasil dihapus');
      setShowDeleteConfirm(false);
      fetchData(meta.page);
    } catch (err: any) {
      // Error is handled by useApi
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setIdToDelete(null);
    }
  };

  const columns = [
    { key: 'no', label: 'No', render: (row: any, idx: number) => (meta.page - 1) * meta.limit + idx + 1 },
    { key: 'username', label: 'Username' },
    { key: 'nama', label: 'Nama', render: (row: any) => row.pegawai?.nama || row.nama || '-' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row: any) => {
        const variants: any = {
          SUPERADMIN: 'danger',
          MANAGER_HRD: 'warning',
          ADMIN_HRD: 'info',
        };
        return <Badge bg={variants[row.role] || 'secondary'}>{row.role}</Badge>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => (
        <Badge bg={row.isActive ? 'success' : 'secondary'}>
          {row.isActive ? 'Aktif' : 'Non-Aktif'}
        </Badge>
      )
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row: any) => {
        const isSelf = authUser?.userId === row.id;
        const isSuperAdmin = authUser?.role === 'SUPERADMIN';
        const canEdit = isSuperAdmin || isSelf;
        const canDelete = isSuperAdmin && !isSelf;

        return (
          <div className="d-flex gap-2">
            {canEdit && (
              <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(row)}>
                <i className="bi bi-pencil"></i>
              </Button>
            )}
            {canDelete && (
              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(row.id)}>
                <i className="bi bi-trash"></i>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Kelola User</h4>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-person-plus-fill me-2"></i>User Baru
        </Button>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Cari Username, Email, atau Nama Pegawai..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.role || ''}
                onChange={(e) => setFilters({ ...filters, role: e.target.value || null })}
              >
                <option value="">Semua Role</option>
                <option value="SUPERADMIN">Superadmin</option>
                <option value="MANAGER_HRD">Manager HRD</option>
                <option value="ADMIN_HRD">Admin HRD</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{isEdit ? 'Edit User' : 'Tambah User Baru'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nama Pengguna (Pegawai)</Form.Label>
                  <Form.Control
                    list="pegawaiOptions"
                    name="pegawaiName"
                    value={formData.pegawaiName}
                    onChange={handlePegawaiNameChange}
                    placeholder="Ketik nama atau NIP pegawai..."
                    isInvalid={!!errors.pegawaiId}
                  />
                  <datalist id="pegawaiOptions">
                    {formData.pegawaiName.length >= 2 && pegawaiList.map((p: any) => (
                      <option key={p.id} value={`${p.nama} (${p.nip})`} />
                    ))}
                  </datalist>
                  {errors.pegawaiId && <div className="text-danger small mt-1">{errors.pegawaiId}</div>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Username</Form.Label>
                  <Form.Control
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    isInvalid={!!errors.username}
                    placeholder="minimal 6 karakter, lowercase"
                  />
                  {checkingUsername && <div className="text-info small mt-1">Mengecek ketersediaan...</div>}
                  <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@email.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">No. Seluler</Form.Label>
                  <Form.Control 
                    name="nomorHp"
                    type="text"
                    value={formData.nomorHp} 
                    onChange={handleInputChange}
                    placeholder="0812xxxx"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password {isEdit && '(Kosongkan jika tidak diubah)'}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!errors.password}
                    />
                    <Button variant="outline-secondary" onClick={generateRandomPassword}>
                      Generate
                    </Button>
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Ketik Ulang Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={authUser?.role !== 'SUPERADMIN'}
                  >
                    <option value="SUPERADMIN">Superadmin</option>
                    <option value="MANAGER_HRD">Manager HRD</option>
                    <option value="ADMIN_HRD">Admin HRD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-center">
                <Form.Group className="mb-3 pt-4">
                  <Form.Check
                    type="checkbox"
                    id="isActive-check"
                    label="Aktif"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="fw-semibold"
                    disabled={authUser?.role !== 'SUPERADMIN'}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowModal(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={formLoading}>
              {formLoading ? 'Menyimpan...' : (isEdit ? 'Perbarui User' : 'Simpan User')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Hapus User"
        message="Apakah Anda yakin ingin menghapus user ini? Akun ini akan dihapus secara permanen."
      />

      <Modal show={showCreatedModal} onHide={() => setShowCreatedModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-success">User Berhasil Dibuat!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p>Harap simpan informasi login berikut. Password ini tidak akan ditampilkan lagi.</p>
          <Card className="bg-light border-0 p-3 mb-0 font-monospace">
            <div><strong>Username:</strong> {createdUser?.username}</div>
            <div><strong>Password:</strong> {createdUser?.rawPassword}</div>
          </Card>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="primary" onClick={() => setShowCreatedModal(false)}>
            Selesai
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
