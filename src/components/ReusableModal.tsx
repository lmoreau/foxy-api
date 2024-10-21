import React, { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';
import axios from 'axios';

interface ReusableModalProps {
  isVisible: boolean;
  onOk: (selectedValue: string) => void;
  onCancel: () => void;
  fetchUrl: string;
  title: string;
}

interface OptionItem {
  id: string;
  displayValue: string;
}

const ReusableModal: React.FC<ReusableModalProps> = ({ isVisible, onOk, onCancel, fetchUrl, title }) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    if (isVisible) {
      fetchOptions();
    }
  }, [isVisible, fetchUrl]);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(fetchUrl);
      if (response.data && Array.isArray(response.data.value)) {
        const mappedOptions = response.data.value.map((item: any) => ({
          id: item.id,
          displayValue: item.displayValue || 'No value available'
        }));
        setOptions(mappedOptions);
      } else {
        console.error('Unexpected API response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleOk = () => {
    onOk(selectedValue);
  };

  return (
    <Modal title={title} open={isVisible} onOk={handleOk} onCancel={onCancel}>
      <Select
        style={{ width: '100%' }}
        placeholder="Select an option"
        onChange={(value) => setSelectedValue(value)}
        value={selectedValue}
      >
        {options.map((option) => (
          <Select.Option key={option.id} value={option.id}>
            {option.displayValue}
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
};

export default ReusableModal;
