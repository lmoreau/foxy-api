import React from 'react';
import { Modal } from 'antd';

interface AddLocationModalProps {
  isVisible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isVisible, onOk, onCancel }) => {
  return (
    <Modal title="Add Location" visible={isVisible} onOk={onOk} onCancel={onCancel}>
      <p>Add Location dialog content goes here.</p>
    </Modal>
  );
};

export default AddLocationModal;
