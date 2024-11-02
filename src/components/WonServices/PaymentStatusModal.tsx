import React, { useState } from 'react';
import { Modal, Select } from 'antd';
import { inPaymentStatusMapper } from '../../utils/constants/inPaymentStatusMapper';

interface PaymentStatusModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (status: number) => void;
    selectedCount: number;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
    visible,
    onCancel,
    onConfirm,
    selectedCount,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

    const paymentStatusOptions = Object.entries(inPaymentStatusMapper).map(([value, label]) => ({
        value: parseInt(value),
        label
    }));

    const handleOk = () => {
        if (selectedStatus !== null) {
            onConfirm(selectedStatus);
            setSelectedStatus(null);
        }
    };

    const handleCancel = () => {
        setSelectedStatus(null);
        onCancel();
    };

    return (
        <Modal
            title="Change Payment Status"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{ disabled: selectedStatus === null }}
        >
            <p>Change payment status for {selectedCount} selected service{selectedCount !== 1 ? 's' : ''}:</p>
            <Select
                style={{ width: '100%' }}
                placeholder="Select new payment status"
                options={paymentStatusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
            />
        </Modal>
    );
};

export default PaymentStatusModal;
