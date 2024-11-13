import React, { useState } from 'react';
import { Modal, Input, Form } from 'antd';

interface SubjectEditModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (subject: string) => void;
  initialValue: string;
}

const SubjectEditModal: React.FC<SubjectEditModalProps> = ({
  open,
  onCancel,
  onConfirm,
  initialValue
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Edit Subject"
      open={open}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(values => {
          onConfirm(values.subject);
          form.resetFields();
        });
      }}
    >
      <Form
        form={form}
        initialValues={{ subject: initialValue }}
      >
        <Form.Item
          name="subject"
          rules={[{ required: true, message: 'Please input a subject' }]}
        >
          <Input placeholder="Enter subject" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectEditModal; 