import React from 'react';
import { Modal, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface ResidualRecord {
  key: string;
  foxyflow_product: string;
  foxyflow_rogerscompanyname: string;
  foxyflow_charge_item_code: string;
  foxyflow_month: string;
  foxyflow_actuals: string;
  foxyflow_billingnumber: string;
  foxyflow_residualserviceid: string;
}

interface GroupedResidualData {
  key: string;
  billingNumber: string;
  totalAmount: number;
  children: ResidualRecord[];
}

interface WirelineRecord {
  key: string;
  foxy_serviceid: string;
  foxy_description: string;
  foxy_charges: string;
  foxy_addressline1: string;
  foxy_city: string;
  foxy_province: string;
  foxy_postalcode: string;
  foxy_quantity: number;
  foxy_contractterm: number;
  foxyflow_estrenewaldtgible: string;
  foxy_estimatedenddate: string;
  foxy_billingeffectivedate: string;
  foxy_companyname: string;
  foxy_accountowner: string;
  foxy_sitename: string;
  foxy_signacct: string;
}

interface GroupedWirelineData {
  key: string;
  foxy_signacct: string;
  children: WirelineRecord[];
  totalCharges: number;
}

interface ResidualRowsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  data: ResidualRecord[];
  loading: boolean;
  rogersWirelineData?: WirelineRecord[];
  rogersWirelineLoading?: boolean;
}

const generateUniqueKey = (prefix: string, index: number, ...parts: (string | number | undefined)[]): string => {
  const validParts = parts
    .map(part => part?.toString() || '')
    .filter(Boolean)
    .join('-');
  return `${prefix}-${index}-${validParts || 'empty'}`;
};

const ResidualRowsModal: React.FC<ResidualRowsModalProps> = ({
  isVisible,
  onCancel,
  data,
  loading,
  rogersWirelineData,
  rogersWirelineLoading
}) => {
  const residualColumns: ColumnsType<GroupedResidualData | ResidualRecord> = [
    {
      title: 'Product',
      key: 'product',
      width: '30%',
      render: (_, record) => {
        if ('children' in record) {
          return `Billing Number: ${record.billingNumber}`;
        }
        return record.foxyflow_product;
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
        const value = 'totalAmount' in record ? record.totalAmount : record.foxyflow_actuals;
        if (!value) return null;
        const num = parseFloat(value.toString());
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    }
  ];

  const formatDescription = (record: WirelineRecord): string => {
    let desc = record.foxy_description || 'No Description';
    if (record.foxy_quantity > 1) {
      desc += ` x ${record.foxy_quantity}`;
    }
    if (record.foxy_contractterm) {
      desc += ` - ${record.foxy_contractterm} months`;
    }
    return desc;
  };

  const rogersWirelineColumns: ColumnsType<GroupedWirelineData | WirelineRecord> = [
    {
      title: 'Description',
      key: 'description',
      fixed: 'left',
      width: 350,
      render: (_, record) => {
        if ('children' in record) {
          return `Account: ${record.foxy_signacct}`;
        }
        return formatDescription(record);
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
        if ('children' in record) return null;
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
        if ('children' in record) return null;
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
      key: 'charges',
      width: 120,
      render: (_, record) => {
        const value = 'totalCharges' in record ? record.totalCharges : record.foxy_charges;
        if (!value) return null;
        const num = parseFloat(value.toString());
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    }
  ];

  const processedResidualData = React.useMemo(() => {
    if (!data) return [];
    
    const groupedByBilling = data.reduce<Record<string, GroupedResidualData>>((acc, item, index) => {
      const billingNumber = item.foxyflow_billingnumber || 'No Billing Number';
      if (!acc[billingNumber]) {
        acc[billingNumber] = {
          key: generateUniqueKey('billing', index, billingNumber),
          billingNumber,
          children: [],
          totalAmount: 0
        };
      }
      acc[billingNumber].children.push({
        ...item,
        key: generateUniqueKey('residual', index, billingNumber, item.foxyflow_product, item.foxyflow_residualserviceid)
      });
      acc[billingNumber].totalAmount += parseFloat(item.foxyflow_actuals || '0');
      return acc;
    }, {});

    return Object.values(groupedByBilling);
  }, [data]);

  const processedRogersWirelineData = React.useMemo(() => {
    if (!rogersWirelineData) return [];
    
    const groupedBySignAcct = rogersWirelineData.reduce<Record<string, GroupedWirelineData>>((acc, item, index) => {
      const signAcct = item.foxy_signacct || 'No Account';
      if (!acc[signAcct]) {
        acc[signAcct] = {
          key: generateUniqueKey('account', index, signAcct),
          foxy_signacct: signAcct,
          children: [],
          totalCharges: 0
        };
      }
      acc[signAcct].children.push({
        ...item,
        key: generateUniqueKey('wireline', index, signAcct, item.foxy_serviceid, item.foxy_description)
      });
      acc[signAcct].totalCharges += parseFloat(item.foxy_charges || '0');
      return acc;
    }, {});

    return Object.values(groupedBySignAcct).map(group => ({
      ...group,
      children: [...group.children].sort((a, b) => {
        const serviceIdCompare = (a.foxy_serviceid || '').localeCompare(b.foxy_serviceid || '');
        if (serviceIdCompare !== 0) return serviceIdCompare;
        return (a.foxy_description || '').localeCompare(b.foxy_description || '');
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
