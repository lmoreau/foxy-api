import React, { useState } from 'react';
import { Table, Input, Empty } from 'antd';
import { useIsAuthenticated } from "@azure/msal-react";
import { listMasterResidualBillingRows } from '../utils/api';

interface MasterResidualBillingRow {
  foxy_billingrecordid: string;
  foxy_companyname: string;
  foxy_productdescription: string;
  foxy_ban: string;
  foxy_billedrevenue: number;
  foxy_billedmonthyear: string;
}

const { Search } = Input;

const MasterResidualList: React.FC = () => {
  const [data, setData] = useState<MasterResidualBillingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  const fetchData = async (ban: string) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await listMasterResidualBillingRows(ban);
      setData(response);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      year: 'numeric'
    });
  };

  const groupedData = data.reduce((acc, item) => {
    const period = formatDate(item.foxy_billedmonthyear);
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(item);
    return acc;
  }, {} as Record<string, MasterResidualBillingRow[]>);

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'foxy_companyname',
      key: 'companyName',
      sorter: (a: MasterResidualBillingRow, b: MasterResidualBillingRow) => 
        (a.foxy_companyname || '').localeCompare(b.foxy_companyname || ''),
    },
    {
      title: 'Product',
      dataIndex: 'foxy_productdescription',
      key: 'product',
      sorter: (a: MasterResidualBillingRow, b: MasterResidualBillingRow) => 
        (a.foxy_productdescription || '').localeCompare(b.foxy_productdescription || ''),
    },
    {
      title: 'Billing Number',
      dataIndex: 'foxy_ban',
      key: 'billingNumber',
    },
    {
      title: 'Actuals',
      dataIndex: 'foxy_billedrevenue',
      key: 'actuals',
      render: (value: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value),
      sorter: (a: MasterResidualBillingRow, b: MasterResidualBillingRow) => 
        (a.foxy_billedrevenue || 0) - (b.foxy_billedrevenue || 0),
    },
  ];

  const handleSearch = (value: string) => {
    if (value.trim()) {
      fetchData(value.trim());
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Master Residual List</h1>
      <Search
        placeholder="Enter billing number to search"
        allowClear
        enterButton="Search"
        size="large"
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      {Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(period => {
        const subtotal = groupedData[period].reduce((sum, item) => sum + item.foxy_billedrevenue, 0);
        return (
          <div key={period}>
            <h2>{period}</h2>
            <Table
              columns={columns}
              dataSource={groupedData[period]}
              loading={loading}
              rowKey="foxy_billingrecordid"
              scroll={{ x: true }}
              pagination={false}
              locale={{
                emptyText: hasSearched ? <Empty description="No records found" /> : <Empty description="Enter a billing number to search" />
              }}
            />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <strong>Subtotal: </strong>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(subtotal)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MasterResidualList;
