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
      title: 'Province',
      dataIndex: 'foxy_province',
      key: 'foxy_province',
      ellipsis: true,
    },
    {
      title: 'Postal Code',
      dataIndex: 'foxy_postalcode',
      key: 'foxy_postalcode',
      ellipsis: true,
    },
    {
      title: 'Service ID',
      dataIndex: 'foxy_serviceid',
      key: 'foxy_serviceid',
      ellipsis: true,
    },
    {
      title: 'Est. Renewal Date',
      dataIndex: 'foxyflow_estrenewaldtgible',
      key: 'foxyflow_estrenewaldtgible',
      ellipsis: true,
    },
    {
      title: 'Est. End Date',
      dataIndex: 'foxy_estimatedenddate',
      key: 'foxy_estimatedenddate',
      ellipsis: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'foxy_quantity',
      key: 'foxy_quantity',
      ellipsis: true,
    },
    {
      title: 'Base Charges',
      dataIndex: 'foxy_charges_base',
      key: 'foxy_charges_base',
      ellipsis: true,
    },
    {
      title: 'Service ID',
      dataIndex: 'foxy_serviceid',
      key: 'foxy_serviceid',
      ellipsis: true,
    },
    {
      title: 'Billing Effect Date',
      dataIndex: 'foxy_billingeffectivedate',
      key: 'foxy_billingeffectivedate',
      ellipsis: true,
    },
    {
      title: 'City',
      dataIndex: 'foxy_city',
      key: 'foxy_city',
      ellipsis: true,
    },
    {
      title: 'Address',
      dataIndex: 'foxy_addressline1',
      key: 'foxy_addressline1',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'foxy_description',
      key: 'foxy_description',
      ellipsis: true,
    },
    {
      title: 'Company Name',
      dataIndex: 'foxy_companyname',
      key: 'foxy_companyname',
      ellipsis: true,
    },
    {
      title: 'Account Owner',
      dataIndex: 'foxy_accountowner',
      key: 'foxy_accountowner',
      ellipsis: true,
    },
    {
      title: 'Contract Term',
      dataIndex: 'foxy_contractterm',
      key: 'foxy_contractterm',
      ellipsis: true,
    },
    {
      title: 'Site Name',
      dataIndex: 'foxy_sitename',
      key: 'foxy_sitename',
      ellipsis: true,
    },
    {
      title: 'Charges',
      dataIndex: 'foxy_charges',
      key: 'foxy_charges',
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
          scroll={{ y: 400, x: 2000 }}
          size="middle"
        />
      </div>
    </Modal>
  );
};

export default ResidualRowsModal;
