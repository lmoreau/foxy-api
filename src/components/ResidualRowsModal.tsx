import React from 'react';
import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface ResidualRowsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  data: any[];
  loading: boolean;
}

const ResidualRowsModal: React.FC<ResidualRowsModalProps> = ({
  isVisible,
  onCancel,
  data,
  loading
}) => {
  const columns: ColumnsType<any> = [
    {
      title: 'Service',
      dataIndex: 'foxyflow_name',
      key: 'foxyflow_name',
    },
    {
      title: 'Amount',
      dataIndex: 'foxyflow_amount',
      key: 'foxyflow_amount',
      render: (value) => {
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    },
    {
      title: 'Status',
      dataIndex: 'foxyflow_status',
      key: 'foxyflow_status',
    },
    {
      title: 'Notes',
      dataIndex: 'foxyflow_notes',
      key: 'foxyflow_notes',
    }
  ];

  return (
    <Modal
      title="Residual Service Details"
      open={isVisible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="foxyflow_residualserviceid"
        pagination={false}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default ResidualRowsModal;
