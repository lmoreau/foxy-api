import React from 'react';
import { Modal, Input, Form } from 'antd';

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
            onConfirm(values.internalNotes || undefined, values.disputeNotes);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
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
        >
            <Form form={form} layout="vertical" requiredMark="optional">
                <Form.Item
                    name="internalNotes"
                    label="Internal Notes"
                    required={false}
                >
                    <TextArea rows={4} placeholder="Enter internal notes (optional)" />
                </Form.Item>
                <Form.Item
                    name="disputeNotes"
                    label="Dispute Notes"
                    rules={[{ required: true, message: 'Please enter dispute notes' }]}
                >
                    <TextArea rows={4} placeholder="Enter dispute notes" />
                </Form.Item>
                <div style={{ marginTop: '8px', color: '#666' }}>
                    This will update {selectedCount} selected service{selectedCount !== 1 ? 's' : ''}.
                </div>
            </Form>
        </Modal>
    );
};

export default DisputeModal;
