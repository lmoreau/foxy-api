import React, { useState, useCallback } from 'react';
import { Modal, Form, Mentions } from 'antd';
import { getDynamicsAccessToken } from '../../auth/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:7071/api';

interface CreatePostModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (text: string) => void;
  loading?: boolean;
}

interface User {
  systemuserid: string;
  fullname: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(false);

  const onSearch = useCallback(async (search: string) => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    try {
      setFetching(true);
      const token = await getDynamicsAccessToken();
      const response = await axios.get(
        `${API_BASE_URL}/listUsers?search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );
      setUsers(response.data.value);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const text = values.text.replace(/@(\S+\s+\S+|\S+)/g, (_match: string, username: string) => {
        const user = users.find(u => u.fullname === username);
        if (user) {
          return `@[8,${user.systemuserid},"${user.fullname}"]`;
        }
        return `@${username}`;
      });
      onSubmit(text);
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
          <Mentions
            loading={fetching}
            onSearch={onSearch}
            rows={4}
            placeholder="Enter your post content here... Use @ to mention users"
            options={users.map(user => ({
              key: user.systemuserid,
              value: user.fullname,
              label: user.fullname,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
