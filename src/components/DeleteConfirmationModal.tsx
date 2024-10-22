import React from 'react';
import { Modal } from 'antd';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => (
  <Modal
    title="Confirm Deletion"
    open={visible}
    onOk={onConfirm}
    onCancel={onCancel}
  >
    <p>Are you sure you want to delete this line item? This action cannot be undone.</p>
  </Modal>
);

export default DeleteConfirmationModal;
