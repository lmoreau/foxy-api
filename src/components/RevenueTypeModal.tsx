import React from 'react';
import { Modal, Form, DatePicker, Select, InputNumber, Input } from 'antd';
import { CalendarOutlined, TagOutlined, NumberOutlined, DollarOutlined } from '@ant-design/icons';

interface RevenueTypeModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const RevenueTypeModal: React.FC<RevenueTypeModalProps> = ({
  visible,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Revenue Type Configuration"
      open={visible}
      onOk={() => {
        form.validateFields().then(() => {
          onOk();
        });
      }}
      onCancel={onCancel}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="renewalDate"
          label="Renewal Date"
          rules={[{ required: true, message: 'Please select a renewal date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="renewalType"
          label="Renewal Type"
          rules={[{ required: true, message: 'Please select a renewal type' }]}
        >
          <Select suffixIcon={<TagOutlined />}>
            <Select.Option value="Renewal Eligible">Renewal Eligible</Select.Option>
            <Select.Option value="Early Renewal">Early Renewal</Select.Option>
            <Select.Option value="Mid-Contract Upgrade">Mid-Contract Upgrade</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="existingQuantity"
          label="Existing Quantity"
          rules={[{ required: true, message: 'Please enter the existing quantity' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            prefix={<NumberOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="existingMrrEach"
          label="Existing MRR Each"
          rules={[{ required: true, message: 'Please enter the existing MRR each' }]}
        >
          <InputNumber
            min={0}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => {
              const parsedValue = value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0;
              return isNaN(parsedValue) ? 0 : parsedValue;
            }}
            style={{ width: '100%' }}
            prefix={<DollarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="additionalDetails"
          label="Additional Details"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RevenueTypeModal;
