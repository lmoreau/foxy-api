import React from 'react';
import { Modal, Select, Input } from 'antd';
import wirelineResidualsMap from '../utils/wirelineResidualsMapper';

const { TextArea } = Input;

interface ResidualStatusModalProps {
  isVisible: boolean;
  selectedValue: string;
  notes: string;
  onValueChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onOk: () => void;
  onCancel: () => void;
  updating: boolean;
}

export const ResidualStatusModal: React.FC<ResidualStatusModalProps> = ({
  isVisible,
  selectedValue,
  notes,
  onValueChange,
  onNotesChange,
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
      okButtonProps={{ disabled: !selectedValue }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Select
          style={{ width: '100%' }}
          value={selectedValue}
          onChange={onValueChange}
          options={wirelineResidualsMap.map(({ value, label }) => ({
            value,
            label
          }))}
          placeholder="Select a status"
        />
      </div>
      <TextArea
        rows={5}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Enter notes (optional)"
      />
    </Modal>
  );
};
