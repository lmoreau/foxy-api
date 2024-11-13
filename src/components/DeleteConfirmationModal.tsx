import React from 'react';
import { Modal } from 'antd';

interface DeleteConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => (
  <Modal
    title="Confirm Deletion"
    open={open}
    onOk={onConfirm}
    onCancel={onCancel}
  >
    <p>Are you sure you want to delete this line item? This action cannot be undone.</p>
  </Modal>
);

export default DeleteConfirmationModal;
