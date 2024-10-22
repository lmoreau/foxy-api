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
    },
    {
      title: 'Rogers Company Name',
      dataIndex: 'foxyflow_rogerscompanyname',
      key: 'foxyflow_rogerscompanyname',
    },
    {
      title: 'Charge Item Code',
      dataIndex: 'foxyflow_charge_item_code',
      key: 'foxyflow_charge_item_code',
    },
    {
      title: 'Company',
      dataIndex: '_foxyflow_company_value@OData.Community.Display.V1.FormattedValue',
      key: 'foxyflow_company',
    },
    {
      title: 'Amount',
      dataIndex: 'foxyflow_actuals',
      key: 'foxyflow_actuals',
      render: (value) => {
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    },
    {
      title: 'Billing Number',
      dataIndex: 'foxyflow_billingnumber',
      key: 'foxyflow_billingnumber',
    },
    {
      title: 'Month',
      dataIndex: 'foxyflow_month',
      key: 'foxyflow_month',
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
