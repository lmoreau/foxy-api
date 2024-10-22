import React from 'react';
import { Modal, Table, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

interface ResidualRowsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  data: any[];
  loading: boolean;
  rogersWirelineData?: any[];
  rogersWirelineLoading?: boolean;
}

const ResidualRowsModal: React.FC<ResidualRowsModalProps> = ({
  isVisible,
  onCancel,
  data,
  loading,
  rogersWirelineData,
  rogersWirelineLoading
}) => {
  const columns: ColumnsType<any> = [
    {
      title: 'Product',
      dataIndex: 'foxyflow_product',
      key: 'foxyflow_product',
      width: '25%',
      ellipsis: true,
    },
    {
      title: 'Rogers Company Name',
      dataIndex: 'foxyflow_rogerscompanyname',
      key: 'foxyflow_rogerscompanyname',
      width: '25%',
      ellipsis: true,
    },
    {
      title: 'Charge Item Code',
      dataIndex: 'foxyflow_charge_item_code',
      key: 'foxyflow_charge_item_code',
      width: '15%',
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'foxyflow_actuals',
      key: 'foxyflow_actuals',
      width: '10%',
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
      width: '15%',
      ellipsis: true,
    },
    {
      title: 'Month',
      dataIndex: 'foxyflow_month',
      key: 'foxyflow_month',
      width: '10%',
      ellipsis: true,
    }
  ];

  const formatRogersWirelineData = (data: any[]) => {
    if (!data || data.length === 0) return 'No Rogers Wireline records found.';
    return data.map((record, index) => {
      const fields = Object.entries(record)
        .filter(([key]) => !key.startsWith('@'))
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      return `Record ${index + 1}:\n${fields}\n`;
    }).join('\n');
  };

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
      <div style={{ marginTop: '20px' }}>
        <h3>Rogers Wireline Records</h3>
        <TextArea
          value={rogersWirelineLoading ? 'Loading...' : formatRogersWirelineData(rogersWirelineData || [])}
          readOnly
          style={{ width: '100%', minHeight: '200px', marginTop: '10px' }}
        />
      </div>
    </Modal>
  );
};

export default ResidualRowsModal;
