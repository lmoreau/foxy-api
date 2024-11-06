import React, { useState, useEffect } from 'react';
import { Table, Input, Empty, Collapse, Button } from 'antd';
import { useIsAuthenticated } from "@azure/msal-react";
import { listMasterResidualBillingRows } from '../utils/api';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

interface MasterResidualBillingRow {
  foxy_billingrecordid: string;
  foxy_companyname: string;
  foxy_productdescription: string;
  foxy_ban: string;
  foxy_billedrevenue: number;
  foxy_billedmonthyear: string;
}

const { Search } = Input;
const { Panel } = Collapse;

const MasterResidualList: React.FC = () => {
  const [data, setData] = useState<MasterResidualBillingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  useEffect(() => {
    // Check for search parameter in URL
    const params = new URLSearchParams(location.search);
    const searchBan = params.get('search');
    if (searchBan) {
      fetchData(searchBan);
    }
  }, [location.search]);

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
      setExpandedPanels([]); // Reset expanded panels on new search
    }
  };

  const periods = Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleExpandAll = () => {
    if (expandedPanels.length === periods.length) {
      setExpandedPanels([]);
    } else {
      setExpandedPanels(periods);
    }
  };

  const isAllExpanded = expandedPanels.length === periods.length && periods.length > 0;

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
        defaultValue={new URLSearchParams(location.search).get('search') || ''}
      />
      {periods.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Button 
            onClick={handleExpandAll}
            icon={isAllExpanded ? <UpOutlined /> : <DownOutlined />}
          >
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      )}
      <Collapse 
        activeKey={expandedPanels}
        onChange={(keys) => setExpandedPanels(typeof keys === 'string' ? [keys] : keys)}
      >
        {periods.map(period => {
          const subtotal = groupedData[period].reduce((sum, item) => sum + item.foxy_billedrevenue, 0);
          return (
            <Panel header={`${period} - ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(subtotal)}`} key={period}>
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
            </Panel>
          );
        })}
      </Collapse>
      {periods.length === 0 && (
        <Empty description={hasSearched ? "No records found" : "Enter a billing number to search"} />
      )}
    </div>
  );
};

export default MasterResidualList;
