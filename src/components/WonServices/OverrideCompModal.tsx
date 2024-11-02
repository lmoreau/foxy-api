import React, { useState } from 'react';
import { Modal, InputNumber } from 'antd';

interface OverrideCompModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (amount: number) => void;
    selectedCount: number;
}

const OverrideCompModal: React.FC<OverrideCompModalProps> = ({
    visible,
    onCancel,
    onConfirm,
    selectedCount
}) => {
    const [amount, setAmount] = useState<number | null>(null);

    const handleOk = () => {
        if (amount !== null) {
            onConfirm(amount);
        }
    };

    return (
        <Modal
            title="Override Expected Compensation"
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            okButtonProps={{ disabled: amount === null }}
        >
            <p>Enter the new compensation amount for {selectedCount} selected service{selectedCount !== 1 ? 's' : ''}:</p>
            <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                onChange={(value: number | null) => setAmount(value)}
                precision={2}
                placeholder="Enter amount"
            />
        </Modal>
    );
};

export default OverrideCompModal;
