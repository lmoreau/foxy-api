import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { updateQuoteLineItem } from '../../utils/api';

const { TextArea } = Input;

interface CommentModalProps {
  open: boolean;
  comment: string;
  onCancel: () => void;
  onConfirm: (updatedComment: string) => void;
  lineItemId: string;
}

const CommentModal: React.FC<CommentModalProps> = ({ open, comment, onCancel, onConfirm, lineItemId }) => {
  const [currentComment, setCurrentComment] = useState(comment);

  useEffect(() => {
    setCurrentComment(comment);
  }, [comment]);

  const handleConfirm = async () => {
    try {
      await updateQuoteLineItem({
        id: lineItemId,
        foxy_comment: currentComment
      });
      onConfirm(currentComment);
    } catch (error) {
      console.error('Error updating comment:', error);
      message.error('Failed to update comment');
    }
  };

  return (
    <Modal
      title="Comment"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          Confirm
        </Button>,
      ]}
    >
      <TextArea rows={5} value={currentComment} onChange={(e) => setCurrentComment(e.target.value)} />
    </Modal>
  );
};

export default CommentModal;