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

interface GroupedResidualData {
  key: string;
  billingNumber: string;
  totalAmount: number;
  children: any[];
}

interface GroupedWirelineData {
  key: string;
  foxy_signacct: string;
  children: Array<{
    key: string;
    foxy_serviceid: string;
    foxy_description: string;
    foxy_charges: string;
    foxy_addressline1?: string;
    foxy_city?: string;
    foxy_province?: string;
    foxy_postalcode?: string;
    foxy_quantity?: number;
    foxy_contractterm?: number;
    foxyflow_estrenewaldtgible?: string;
    foxy_estimatedenddate?: string;
    foxy_billingeffectivedate?: string;
    foxy_companyname?: string;
    foxy_accountowner?: string;
    foxy_sitename?: string;
  }>;
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
      width: '30%',
      render: (_, record) => {
        if (record.foxyflow_product) {
          return record.foxyflow_product;
        }
        return `Billing Number: ${record.billingNumber}`;
      },
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
      title: 'Month',
      dataIndex: 'foxyflow_month',
      key: 'foxyflow_month',
      width: '15%',
      ellipsis: true,
    },
    {
      title: 'Amount',
      key: 'amount',
      width: '15%',
      render: (_, record) => {
        const value = record.foxyflow_actuals || record.totalAmount;
        if (!value) return null;
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    }
  ];

  const formatDescription = (record: GroupedWirelineData['children'][0]) => {
    const qty = record.foxy_quantity;
    const term = record.foxy_contractterm;
    let desc = record.foxy_description;
    
    if (qty && qty > 1) {
      desc += ` x ${qty}`;
    }
    if (term) {
      desc += ` - ${term} months`;
    }
    return desc;
  };

  const rogersWirelineColumns: ColumnsType<GroupedWirelineData> = [
    {
      title: 'Description',
      key: 'description',
      fixed: 'left',
      width: 350,
      render: (_, record) => {
        if ('children' in record) {
          return `Account: ${record.foxy_signacct}`;
        }
        return formatDescription(record as GroupedWirelineData['children'][0]);
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
        if ('children' in record) return null;
        const r = record as GroupedWirelineData['children'][0];
        if (!r.foxy_addressline1) return null;
        return (
          <Tooltip title={`${r.foxy_city}, ${r.foxy_province} ${r.foxy_postalcode}`}>
            {r.foxy_addressline1}
          </Tooltip>
        );
      },
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 200,
      render: (_, record) => {
        if ('children' in record) return null;
        const r = record as GroupedWirelineData['children'][0];
        if (!r.foxyflow_estrenewaldtgible) return null;
        return (
          <>
            Renewal: {r.foxyflow_estrenewaldtgible}<br />
            End: {r.foxy_estimatedenddate}<br />
            Billing: {r.foxy_billingeffectivedate}
          </>
        );
      },
    },
    {
      title: 'Company Info',
      key: 'company',
      width: 250,
      render: (_, record) => {
        if ('children' in record) return null;
        const r = record as GroupedWirelineData['children'][0];
        if (!r.foxy_companyname) return null;
        return (
          <>
            {r.foxy_companyname}<br />
            Owner: {r.foxy_accountowner}<br />
            Site: {r.foxy_sitename}
          </>
        );
      },
    },
    {
      title: 'Charges',
      key: 'foxy_charges',
      width: 120,
      render: (_, record) => {
        const value = 'totalCharges' in record ? record.totalCharges : record.foxy_charges;
        if (!value) return null;
        const num = parseFloat(value);
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    }
  ];

  // Process and group Residual data by Billing Number
  const processedResidualData = React.useMemo(() => {
    if (!data) return [];
    
    const groupedByBilling = data.reduce((acc: Record<string, GroupedResidualData>, item) => {
      const billingNumber = item.foxyflow_billingnumber || 'No Billing Number';
      if (!acc[billingNumber]) {
        acc[billingNumber] = {
          key: billingNumber,
          billingNumber,
          children: [],
          totalAmount: 0
        };
      }
      acc[billingNumber].children.push({
        ...item,
        key: `${billingNumber}-${item.foxyflow_product}`
      });
      acc[billingNumber].totalAmount += parseFloat(item.foxyflow_actuals || '0');
      return acc;
    }, {});

    return Object.values(groupedByBilling);
  }, [data]);

  // Process and group Rogers Wireline data
  const processedRogersWirelineData = React.useMemo(() => {
    if (!rogersWirelineData) return [];
    
    const groupedBySignAcct = rogersWirelineData.reduce((acc: Record<string, GroupedWirelineData>, item) => {
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
    }, {});

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
        dataSource={processedResidualData}
        loading={loading}
        rowKey="key"
        pagination={false}
        scroll={{ y: 400, x: 1500 }}
        size="middle"
        expandable={{
          defaultExpandAllRows: true,
        }}
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
