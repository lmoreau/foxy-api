import React from 'react';
import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

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
  const residualColumns: ColumnsType<any> = [
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

  const rogersWirelineColumns: ColumnsType<any> = [
    {
      title: 'Description',
      dataIndex: 'foxy_description',
      key: 'foxy_description',
      fixed: 'left',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Service ID',
      dataIndex: 'foxy_serviceid',
      key: 'foxy_serviceid',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Location',
      key: 'location',
      width: 300,
      render: (_, record) => (
        <>
          {record.foxy_addressline1}<br />
          {record.foxy_city}, {record.foxy_province} {record.foxy_postalcode}
        </>
      ),
    },
    {
      title: 'Contract Details',
      key: 'contract',
      width: 200,
      render: (_, record) => (
        <>
          Term: {record.foxy_contractterm} months<br />
          Qty: {record.foxy_quantity}
        </>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 200,
      render: (_, record) => (
        <>
          Renewal: {record.foxyflow_estrenewaldtgible}<br />
          End: {record.foxy_estimatedenddate}<br />
          Billing: {record.foxy_billingeffectivedate}
        </>
      ),
    },
    {
      title: 'Company Info',
      key: 'company',
      width: 200,
      render: (_, record) => (
        <>
          {record.foxy_companyname}<br />
          Owner: {record.foxy_accountowner}<br />
          Site: {record.foxy_sitename}
        </>
      ),
    },
    {
      title: 'Charges',
      dataIndex: 'foxy_charges',
      key: 'foxy_charges',
      width: 120,
      render: (value) => {
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
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
        columns={residualColumns}
        dataSource={data}
        loading={loading}
        rowKey="foxyflow_residualserviceid"
        pagination={false}
        scroll={{ y: 400, x: 1500 }}
        size="middle"
      />
      <div style={{ marginTop: '20px' }}>
        <h3>Rogers Wireline Records</h3>
        <Table
          columns={rogersWirelineColumns}
          dataSource={rogersWirelineData}
          loading={rogersWirelineLoading}
          rowKey={(record) => record.foxy_serviceid || Math.random().toString()}
          pagination={false}
          scroll={{ y: 400, x: 1500 }}
          size="middle"
          groupBy="foxy_serviceid"
        />
      </div>
    </Modal>
  );
};

export default ResidualRowsModal;
