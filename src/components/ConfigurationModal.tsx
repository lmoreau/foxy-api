import React from 'react';
import { Modal } from 'antd';

interface ConfigurationModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  visible,
  onOk,
  onCancel,
}) => (
  <Modal
    title="Configuration Required"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
  >
    <p>Additional configuration is required for this item. (Placeholder for future implementation)</p>
  </Modal>
);

export default ConfigurationModal;
