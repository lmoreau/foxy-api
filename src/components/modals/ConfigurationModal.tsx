import React from 'react';
import { Modal } from 'antd';

interface ConfigurationModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  open,
  onOk,
  onCancel,
}) => (
  <Modal
    title="Configuration"
    open={open}
    onOk={onOk}
    onCancel={onCancel}
  >
    <p>Additional configuration is required for this item. (Placeholder for future implementation)</p>
  </Modal>
);

export default ConfigurationModal;
