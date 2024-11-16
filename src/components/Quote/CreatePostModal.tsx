import React, { useState, useCallback, useRef } from 'react';
import { Modal, Form, Mentions, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const mentionsRef = useRef<any>(null);

  const handleAfterOpen = () => {
    setTimeout(() => {
      if (mentionsRef.current) {
        mentionsRef.current.focus();
      }
    }, 100);
  };

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

  const handleUpload = async (file: File): Promise<string> => {
    try {
      // Get SAS token
      const token = await getDynamicsAccessToken();
      console.log('Got Dynamics token');
      
      const sasResponse = await axios.get(`${API_BASE_URL}/getBlobSasToken`, {
        headers: { Authorization: token }
      });
      console.log('SAS Response:', sasResponse.data);
      
      const { sasToken, storageUri, containerName } = sasResponse.data;
      
      // Upload file to blob storage
      const blobName = `${Date.now()}-${file.name}`;
      const blobUrl = `${storageUri}/${containerName}/${blobName}`;
      console.log('Attempting upload to:', blobUrl);
      
      await axios.put(`${blobUrl}?${sasToken}`, file, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        }
      });
      console.log('Upload successful');

      return `${blobUrl}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleOk = async () => {
    try {
      console.log('Starting post creation...');
      setUploading(true);
      const values = await form.validateFields();
      console.log('Form values:', values);
      console.log('File list:', fileList);
      
      // Handle file upload if present
      let fileUrl = '';
      let fileName = '';
      if (fileList.length > 0) {
        console.log('File detected:', fileList[0]);
        if (fileList[0].originFileObj) {
          console.log('Attempting to upload file:', fileList[0].originFileObj);
          try {
            fileUrl = await handleUpload(fileList[0].originFileObj);
            fileName = fileList[0].name;
            console.log('File uploaded successfully. URL:', fileUrl);
          } catch (uploadError) {
            console.error('File upload failed:', uploadError);
          }
        } else {
          console.warn('No originFileObj found in file:', fileList[0]);
        }
      } else {
        console.log('No files to upload');
      }

      // Transform mentions
      let text = values.text.replace(/@(\S+\s+\S+|\S+)/g, (_match: string, username: string) => {
        const user = users.find(u => u.fullname === username);
        if (user) {
          return `@[8,${user.systemuserid},"${user.fullname}"]`;
        }
        return `@${username}`;
      });
      console.log('Text after mention transformation:', text);

      // Append file information if present
      if (fileUrl && fileName) {
        text = `${text}\n[ATTACHMENT]${fileName}|${fileUrl}[/ATTACHMENT]`;
        console.log('Final text with attachment:', text);
      }

      console.log('Submitting post with text:', text);
      onSubmit(text);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Error in handleOk:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Create Post"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Post"
      confirmLoading={loading || uploading}
      afterOpenChange={(visible) => {
        if (visible) {
          handleAfterOpen();
        }
      }}
    >
      <Form form={form}>
        <Form.Item
          name="text"
          rules={[{ required: true, message: 'Please enter your post content' }]}
        >
          <Mentions
            ref={mentionsRef}
            loading={fetching}
            onSearch={onSearch}
            rows={4}
            autoFocus
            placeholder="Enter your post content here... Use @ to mention users"
            options={users.map(user => ({
              key: user.systemuserid,
              value: user.fullname,
              label: user.fullname,
            }))}
          />
        </Form.Item>
        <Form.Item>
          <Upload
            beforeUpload={(file) => {
              setFileList([{
                uid: '-1',
                name: file.name,
                status: 'done',
                originFileObj: file,
              }]);
              return false;
            }}
            onRemove={() => setFileList([])}
            fileList={fileList}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Attach File</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
