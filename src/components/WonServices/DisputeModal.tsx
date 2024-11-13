import React from 'react';
import { Modal, Input, Form, message } from 'antd';

const { TextArea } = Input;

interface DisputeModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (internalNotes: string | undefined, disputeNotes: string) => void;
    selectedCount: number;
}

const DisputeModal: React.FC<DisputeModalProps> = ({
    visible,
    onCancel,
    onConfirm,
    selectedCount,
}) => {
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            // Validate all fields
            const values = await form.validateFields();
            
            // Get the values after validation
            const internalNotes = values.internalNotes?.trim();
            const disputeNotes = values.disputeNotes?.trim();

            // Additional validation for dispute notes
            if (!disputeNotes) {
                message.error('Dispute notes cannot be empty');
                return;
            }

            // Call onConfirm with the values
            onConfirm(internalNotes || undefined, disputeNotes);
            form.resetFields();
        } catch (error) {
            // Don't show validation error message - the form will show field-level errors
            console.error('Form validation failed:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Create Dispute"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Create"
            cancelText="Cancel"
            maskClosable={false}
            destroyOnClose
        >
            <Form 
                form={form} 
                layout="vertical" 
                requiredMark="optional"
            >
                <Form.Item
                    name="internalNotes"
                    label="Internal Notes"
                >
                    <TextArea 
                        rows={4} 
                        placeholder="Enter internal notes (optional)"
                        maxLength={2000}
                        showCount
                    />
                </Form.Item>
                <Form.Item
                    name="disputeNotes"
                    label="Dispute Notes"
                    rules={[
                        { required: true, message: 'Please enter dispute notes' },
                        { whitespace: true, message: 'Dispute notes cannot be empty' }
                    ]}
                >
                    <TextArea 
                        rows={4} 
                        placeholder="Enter dispute notes"
                        maxLength={2000}
                        showCount
                    />
                </Form.Item>
                <div style={{ marginTop: '8px', color: '#666' }}>
                    This will update {selectedCount} selected service{selectedCount !== 1 ? 's' : ''} and mark them as disputed.
                </div>
            </Form>
        </Modal>
    );
};

export default DisputeModal;
