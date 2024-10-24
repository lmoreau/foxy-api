import React from 'react';
import { Modal, Select } from 'antd';
import wirelineResidualsMap from '../utils/wirelineResidualsMapper';

interface ResidualStatusModalProps {
  isVisible: boolean;
  selectedValue: string;
  onValueChange: (value: string) => void;
  onOk: () => void;
  onCancel: () => void;
  updating: boolean;
}

export const ResidualStatusModal: React.FC<ResidualStatusModalProps> = ({
  isVisible,
  selectedValue,
  onValueChange,
  onOk,
  onCancel,
  updating
}) => {
  return (
    <Modal
      title="Update Wireline Residuals Status"
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={updating}
    >
      <Select
        style={{ width: '100%' }}
        value={selectedValue}
        onChange={onValueChange}
        options={wirelineResidualsMap.map(({ value, label }) => ({
          value,
          label
        }))}
      />
    </Modal>
  );
};
