import React from 'react';
import { Modal, Input, Form } from 'antd';

const { TextArea } = Input;

interface CreatePostModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (text: string) => void;
  loading?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.text);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Create Post"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Post"
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item
          name="text"
          rules={[{ required: true, message: 'Please enter your post content' }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter your post content here..."
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
