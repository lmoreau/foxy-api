import React from 'react';
import { Modal, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface ResidualRowsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  data: any[];
  loading: boolean;
  rogersWirelineData?: any[];
  rogersWirelineLoading?: boolean;
}

interface GroupedData {
  key: string;
  foxy_signacct: string;
  children: any[];
  totalCharges: number;
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

  const formatDescription = (record: any) => {
    const qty = record.foxy_quantity;
    const term = record.foxy_contractterm;
    let desc = record.foxy_description;
    
    if (qty > 1) {
      desc += ` x ${qty}`;
    }
    if (term) {
      desc += ` - ${term} months`;
    }
    return desc;
  };

  const rogersWirelineColumns: ColumnsType<any> = [
    {
      title: 'Description',
      key: 'description',
      fixed: 'left',
      width: 350,
      render: (_, record) => {
        if (record.foxy_description) {
          return formatDescription(record);
        }
        // For group rows, show the Sign Acct
        return `Account: ${record.foxy_signacct}`;
      },
    },
    {
      title: 'Service ID',
      dataIndex: 'foxy_serviceid',
      key: 'foxy_serviceid',
      width: 120,
    },
    {
      title: 'Location',
      key: 'location',
      width: 200,
      render: (_, record) => {
        if (!record.foxy_addressline1) return null;
        return (
          <Tooltip title={`${record.foxy_city}, ${record.foxy_province} ${record.foxy_postalcode}`}>
            {record.foxy_addressline1}
          </Tooltip>
        );
      },
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 200,
      render: (_, record) => {
        if (!record.foxyflow_estrenewaldtgible) return null;
        return (
          <>
            Renewal: {record.foxyflow_estrenewaldtgible}<br />
            End: {record.foxy_estimatedenddate}<br />
            Billing: {record.foxy_billingeffectivedate}
          </>
        );
      },
    },
    {
      title: 'Company Info',
      key: 'company',
      width: 250,
      render: (_, record) => {
        if (!record.foxy_companyname) return null;
        return (
          <>
            {record.foxy_companyname}<br />
            Owner: {record.foxy_accountowner}<br />
            Site: {record.foxy_sitename}
          </>
        );
      },
    },
    {
      title: 'Charges',
      key: 'foxy_charges',
      width: 120,
      render: (_, record) => {
        const value = record.foxy_charges || record.totalCharges;
        if (!value) return null;
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    }
  ];

  // Process and group Rogers Wireline data
  const processedRogersWirelineData = React.useMemo(() => {
    if (!rogersWirelineData) return [];
    
    // First, group by Sign Acct
    const groupedBySignAcct = rogersWirelineData.reduce((acc, item) => {
      const signAcct = item.foxy_signacct || 'No Account';
      if (!acc[signAcct]) {
        acc[signAcct] = {
          key: signAcct,
          foxy_signacct: signAcct,
          children: [],
          totalCharges: 0
        };
      }
      acc[signAcct].children.push({
        ...item,
        key: `${item.foxy_serviceid}-${item.foxy_description}`
      });
      acc[signAcct].totalCharges += parseFloat(item.foxy_charges || '0');
      return acc;
    }, {} as Record<string, GroupedData>);

    // Convert to array and sort children by Service ID
    return Object.values(groupedBySignAcct).map(group => ({
      ...group,
      children: group.children.sort((a, b) => {
        const serviceIdCompare = a.foxy_serviceid.localeCompare(b.foxy_serviceid);
        if (serviceIdCompare !== 0) return serviceIdCompare;
        return a.foxy_description.localeCompare(b.foxy_description);
      })
    }));
  }, [rogersWirelineData]);

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
          dataSource={processedRogersWirelineData}
          loading={rogersWirelineLoading}
          rowKey="key"
          pagination={false}
          scroll={{ y: 400, x: 1500 }}
          size="middle"
          expandable={{
            defaultExpandAllRows: true,
          }}
        />
      </div>
      <style>
        {`
          .ant-table-row-expand-icon-cell {
            padding-right: 0 !important;
          }
        `}
      </style>
    </Modal>
  );
};

export default ResidualRowsModal;
