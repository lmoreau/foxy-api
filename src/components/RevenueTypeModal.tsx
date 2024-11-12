import React from 'react';
import { Modal, Form, DatePicker, Select, InputNumber } from 'antd';
import { QuoteLineItem } from '../types';
import dayjs from 'dayjs';

interface RevenueTypeModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  initialValues?: QuoteLineItem;
}

const RevenueTypeModal: React.FC<RevenueTypeModalProps> = ({
  visible,
  onOk,
  onCancel,
  initialValues
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        foxy_renewaldate: initialValues.foxy_renewaldate ? dayjs(initialValues.foxy_renewaldate) : null
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    form.validateFields().then(() => {
      onOk();
    });
  };

  return (
    <Modal
      title="Revenue Type Configuration"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="foxy_renewaltype"
          label="Renewal Type"
          rules={[{ required: true, message: 'Please select a renewal type' }]}
        >
          <Select>
            <Select.Option value="Early Renewal">Early Renewal</Select.Option>
            <Select.Option value="Within 20% of Contract End">Within 20% of Contract End</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="foxy_renewaldate"
          label="Renewal Date"
          rules={[{ required: true, message: 'Please select a renewal date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="foxy_existingqty"
          label="Existing Quantity"
          rules={[{ required: true, message: 'Please enter the existing quantity' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="foxy_existingmrr"
          label="Existing MRR"
          rules={[{ required: true, message: 'Please enter the existing MRR' }]}
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => {
              const parsedValue = value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0;
              return parsedValue || 0;  // Ensure we always return a number
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RevenueTypeModal;
