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
      title: 'Product',
      dataIndex: 'foxyflow_product',
      key: 'foxyflow_product',
      width: '25%', // Large field for product info
      ellipsis: true,
    },
    {
      title: 'Rogers Company Name',
      dataIndex: 'foxyflow_rogerscompanyname',
      key: 'foxyflow_rogerscompanyname',
      width: '25%', // Large field for company names
      ellipsis: true,
    },
    {
      title: 'Charge Item Code',
      dataIndex: 'foxyflow_charge_item_code',
      key: 'foxyflow_charge_item_code',
      width: '15%', // Medium width, slightly wider than header
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'foxyflow_actuals',
      key: 'foxyflow_actuals',
      width: '10%', // Smaller width for amounts
      ellipsis: true,
      render: (value) => {
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    },
    {
      title: 'Billing Number',
      dataIndex: 'foxyflow_billingnumber',
      key: 'foxyflow_billingnumber',
      width: '15%', // Width matching or slightly wider than header
      ellipsis: true,
    },
    {
      title: 'Month',
      dataIndex: 'foxyflow_month',
      key: 'foxyflow_month',
      width: '10%', // Smaller width for month
      ellipsis: true,
    }
  ];

  return (
    <Modal
      title="Residual Service Details"
      open={isVisible}
      onCancel={onCancel}
      width={1600}
      footer={null}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="foxyflow_residualserviceid"
        pagination={false}
        scroll={{ y: 400, x: 1500 }}
        size="middle"
      />
    </Modal>
  );
};

export default ResidualRowsModal;
