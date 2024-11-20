import React from 'react';
import { Modal, Form, DatePicker, Select, InputNumber, message } from 'antd';
import { QuoteLineItem } from '../../types';
import dayjs from 'dayjs';
import { updateQuoteLineItem } from '../../utils/api';

interface RevenueTypeModalProps {
  open: boolean;
  onOk: (updatedItem: QuoteLineItem) => void;
  onCancel: () => void;
  initialValues?: QuoteLineItem;
}

const RevenueTypeModal: React.FC<RevenueTypeModalProps> = ({
  open,
  onOk,
  onCancel,
  initialValues
}) => {
  const [form] = Form.useForm();

  // Reset form with initial values when modal opens
  React.useEffect(() => {
    if (open && initialValues) {
      form.resetFields();
      form.setFieldsValue({
        ...initialValues,
        foxy_renewaldate: initialValues.foxy_renewaldate ? dayjs(initialValues.foxy_renewaldate) : null,
        foxy_existingqty: initialValues.foxy_existingqty || 1
      });
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Format the date properly for the API
      const formattedValues = {
        ...values,
        foxy_renewaldate: values.foxy_renewaldate?.format('YYYY-MM-DD'),
      };

      // Send the update to the API
      await updateQuoteLineItem({
        id: initialValues?.foxy_foxyquoterequestlineitemid!,
        ...formattedValues
      });

      // Create updated item with all fields for parent component
      const updatedItem: QuoteLineItem = {
        ...initialValues!,
        foxy_renewaltype: values.foxy_renewaltype,
        foxy_renewaldate: values.foxy_renewaldate?.toDate(), // Keep as Date object for UI
        foxy_existingqty: values.foxy_existingqty,
        foxy_existingmrr: values.foxy_existingmrr,
        foxy_foxyquoterequestlineitemid: initialValues?.foxy_foxyquoterequestlineitemid!,
      };

      message.success('Revenue type updated successfully');
      onOk(updatedItem);
    } catch (error) {
      message.error('Failed to update revenue type');
      console.error('Error updating revenue type:', error);
    }
  };

  return (
    <Modal
      title="Revenue Type Configuration"
      open={open}
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
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="foxy_existingmrr"
          label="Existing MRR"
          rules={[{ required: true, message: 'Please enter the existing MRR' }]}
        >
          <InputNumber 
            min={0}
            step={0.01}
            precision={2}
            style={{ width: '100%' }} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RevenueTypeModal;
