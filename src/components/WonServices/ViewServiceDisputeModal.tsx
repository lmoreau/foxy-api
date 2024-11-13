import React from 'react';
import { Modal, Input } from 'antd';
import { WonService } from '../../types/wonServices';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ViewServiceDisputeModalProps {
    visible: boolean;
    onClose: () => void;
    service?: WonService;
}

const ViewServiceDisputeModal: React.FC<ViewServiceDisputeModalProps> = ({
    visible,
    onClose,
    service
}) => {
    const formatDate = (date?: string) => {
        return date ? dayjs(date).format('MM/DD/YY') : '-';
    };

    return (
        <Modal
            title="View Service Dispute"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Transaction Date</div>
                        <Input value={formatDate(service?.foxy_Opportunity?.actualclosedate)} readOnly />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Amount</div>
                        <Input value={service?.foxy_expectedcomp?.toFixed(2) || '-'} readOnly />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Dispute Name</div>
                        <Input value={service?.foxy_serviceid || '-'} readOnly />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Opportunity</div>
                        <Input value={service?.foxy_Opportunity?.foxy_sfdcoppid || '-'} readOnly />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>TCV</div>
                        <Input value={service?.foxy_tcv?.toFixed(2) || '-'} readOnly />
                    </div>
                    <div style={{ flex: 1 }}></div>
                </div>

                <div>
                    <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Account</div>
                    <Input value={service?.foxy_Account?.name || '-'} readOnly />
                </div>

                <div>
                    <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Product</div>
                    <Input value={service?.foxy_Product?.name || '-'} readOnly />
                </div>

                <div>
                    <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Claim Notes</div>
                    <TextArea 
                        value={service?.foxyflow_claimnotes || '-'} 
                        readOnly 
                        autoSize={{ minRows: 3 }}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ViewServiceDisputeModal; 