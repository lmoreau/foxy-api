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
            const values = await form.validateFields();
            
            // Validate dispute notes
            if (!values.disputeNotes || !values.disputeNotes.trim()) {
                message.error('Dispute notes cannot be empty');
                return;
            }

            // Trim whitespace from both fields
            const internalNotes = values.internalNotes?.trim() || undefined;
            const disputeNotes = values.disputeNotes.trim();

            // Log the values being sent
            console.log('Sending dispute data:', {
                internalNotes,
                disputeNotes
            });

            onConfirm(internalNotes, disputeNotes);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
            if (error instanceof Error) {
                message.error(`Validation failed: ${error.message}`);
            } else {
                message.error('Validation failed');
            }
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
                validateTrigger={['onChange', 'onBlur']}
            >
                <Form.Item
                    name="internalNotes"
                    label="Internal Notes"
                    required={false}
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
                        { whitespace: true, message: 'Dispute notes cannot be empty' },
                        { max: 2000, message: 'Dispute notes cannot exceed 2000 characters' }
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
