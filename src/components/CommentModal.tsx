import React from 'react';
import { Modal, Input } from 'antd';

const { TextArea } = Input;

interface CommentModalProps {
  visible: boolean;
  comment: string;
  onCancel: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ visible, comment, onCancel }) => {
  return (
    <Modal
      title="Comment"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <TextArea rows={5} value={comment} readOnly />
    </Modal>
  );
};

export default CommentModal; 