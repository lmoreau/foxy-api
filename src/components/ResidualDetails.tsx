import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { getAccountById, listWirelineResidualRows, listRogersWirelineRecords } from '../utils/api';

interface AccountData {
  name: string;
  foxyflow_wirelineresiduals: number;
}

interface ResidualRecord {
  key: string;
  type: 'residual';
  foxyflow_product: string;
  foxyflow_rogerscompanyname: string;
  foxyflow_charge_item_code: string;
  foxyflow_month: string;
  foxyflow_actuals: string;
  foxyflow_billingnumber: string;
  foxyflow_residualserviceid: string;
}

interface WirelineRecord {
  key: string;
  type: 'wireline';
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

interface GroupedAccountData {
  key: string;
  accountId: string;
  companyName: string;
  totalResidualAmount: number;
  totalWirelineCharges: number;
  children: (ResidualRecord | WirelineRecord)[];
}

const generateUniqueKey = (prefix: string, index: number, ...parts: (string | number | undefined)[]): string => {
  const validParts = parts
    .map(part => part?.toString() || '')
    .filter(Boolean)
    .join('-');
  return `${prefix}-${index}-${validParts || 'empty'}`;
};

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [residualData, setResidualData] = useState<ResidualRecord[]>([]);
  const [wirelineData, setWirelineData] = useState<WirelineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // Fetch account details
        const accountData = await getAccountById(id);
        setAccountData(accountData);

        // Fetch residual rows
        const residualData = await listWirelineResidualRows(id);
        setResidualData(residualData);

        // Fetch wireline records
        const wirelineData = await listRogersWirelineRecords(id);
        setWirelineData(wirelineData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

  const columns: ColumnsType<GroupedAccountData | ResidualRecord | WirelineRecord> = [
    {
      title: 'Description/Product',
      key: 'description',
      width: '30%',
      render: (_, record) => {
        if ('children' in record) {
          return (
            <div>
              <div style={{ fontWeight: 'bold' }}>
                <span style={{ color: '#1890ff' }}>{record.accountId}</span>
                {' - '}
                <span>{record.companyName}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <Tag color="blue">Residual Total: {record.totalResidualAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Tag>
                <Tag color="green">Wireline Total: {record.totalWirelineCharges.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Tag>
              </div>
            </div>
          );
        }
        
        const isWireline = 'foxy_description' in record;
        return (
          <>
            <Tag color={isWireline ? 'green' : 'blue'}>
              {isWireline ? 'Wireline' : 'Residual'}
            </Tag>
            {isWireline ? formatDescription(record as WirelineRecord) : record.foxyflow_product}
          </>
        );
      },
    },
    {
      title: 'Service Details',
      key: 'serviceDetails',
      width: '20%',
      render: (_, record) => {
        if ('children' in record) return null;
        
        const isWireline = 'foxy_description' in record;
        if (isWireline) {
          const wirelineRecord = record as WirelineRecord;
          return (
            <>
              Service ID: {wirelineRecord.foxy_serviceid}<br />
              {wirelineRecord.foxy_addressline1 && (
                <Tooltip title={`${wirelineRecord.foxy_city}, ${wirelineRecord.foxy_province} ${wirelineRecord.foxy_postalcode}`}>
                  {wirelineRecord.foxy_addressline1}
                </Tooltip>
              )}
            </>
          );
        }
        
        const residualRecord = record as ResidualRecord;
        return (
          <>
            Billing Number: {residualRecord.foxyflow_billingnumber}<br />
            Code: {residualRecord.foxyflow_charge_item_code}
          </>
        );
      },
    },
    {
      title: 'Dates',
      key: 'dates',
      width: '20%',
      render: (_, record) => {
        if ('children' in record) return null;
        
        const isWireline = 'foxy_description' in record;
        if (isWireline) {
          const wirelineRecord = record as WirelineRecord;
          return (
            <>
              Renewal: {wirelineRecord.foxyflow_estrenewaldtgible}<br />
              End: {wirelineRecord.foxy_estimatedenddate}<br />
              Billing: {wirelineRecord.foxy_billingeffectivedate}
            </>
          );
        }
        
        return (record as ResidualRecord).foxyflow_month;
      },
    },
    {
      title: 'Company Info',
      key: 'company',
      width: '20%',
      render: (_, record) => {
        if ('children' in record) return null;
        
        const isWireline = 'foxy_description' in record;
        if (isWireline) {
          const wirelineRecord = record as WirelineRecord;
          return (
            <>
              {wirelineRecord.foxy_companyname}<br />
              Owner: {wirelineRecord.foxy_accountowner}<br />
              Site: {wirelineRecord.foxy_sitename}
            </>
          );
        }
        
        return (record as ResidualRecord).foxyflow_rogerscompanyname;
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      width: '10%',
      render: (_, record) => {
        if ('children' in record) return null;
        
        const isWireline = 'foxy_description' in record;
        const value = isWireline 
          ? (record as WirelineRecord).foxy_charges
          : (record as ResidualRecord).foxyflow_actuals;
        
        if (!value) return null;
        const num = parseFloat(value.toString());
        return (
          <Tag color={isWireline ? 'green' : 'blue'}>
            {num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </Tag>
        );
      },
    }
  ];

  const combinedData = React.useMemo(() => {
    if (!residualData || !wirelineData) return [];

    // Create a map to group by company/account
    const groupedData = new Map<string, GroupedAccountData>();

    // Process residual records
    residualData.forEach((item, index) => {
      const accountId = item.foxyflow_billingnumber;
      if (!groupedData.has(accountId)) {
        groupedData.set(accountId, {
          key: generateUniqueKey('account', index, accountId),
          accountId,
          companyName: item.foxyflow_rogerscompanyname,
          totalResidualAmount: 0,
          totalWirelineCharges: 0,
          children: []
        });
      }
      
      const group = groupedData.get(accountId)!;
      group.totalResidualAmount += parseFloat(item.foxyflow_actuals || '0');
      group.children.push({
        ...item,
        type: 'residual',
        key: generateUniqueKey('residual', index, accountId, item.foxyflow_product)
      });
    });

    // Process wireline records
    wirelineData.forEach((item, index) => {
      const accountId = item.foxy_signacct;
      if (!groupedData.has(accountId)) {
        groupedData.set(accountId, {
          key: generateUniqueKey('account', index, accountId),
          accountId,
          companyName: item.foxy_companyname,
          totalResidualAmount: 0,
          totalWirelineCharges: 0,
          children: []
        });
      }
      
      const group = groupedData.get(accountId)!;
      group.totalWirelineCharges += parseFloat(item.foxy_charges || '0');
      group.children.push({
        ...item,
        type: 'wireline',
        key: generateUniqueKey('wireline', index, accountId, item.foxy_serviceid)
      });
    });

    return Array.from(groupedData.values());
  }, [residualData, wirelineData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading || !accountData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{accountData.name}</h1>
      <p>Wireline Residuals: {getWirelineResidualsLabel(accountData.foxyflow_wirelineresiduals)}</p>
      <div style={{ marginTop: '20px' }}>
        <Table
          columns={columns}
          dataSource={combinedData}
          rowKey="key"
          pagination={false}
          scroll={{ x: 1500 }}
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
    </div>
  );
};