import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmVariant?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmVariant = 'danger',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <p className="mb-0 text-secondary">{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? 'Memproses...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
