import React, { useEffect, useState } from 'react';
import { Table, Input } from 'antd';
import { useIsAuthenticated } from "@azure/msal-react";
import { listMasterResidualRows } from '../utils/api';

interface MasterResidualRow {
  foxyflow_residualserviceid: string;
  foxyflow_billingnumber: string;
  foxyflow_rogerscompanyname: string;
  foxyflow_actuals: number;
  foxyflow_product: string;
  foxyflow_Company: {
    name: string;
  };
}

const { Search } = Input;

const MasterResidualList: React.FC = () => {
  const [data, setData] = useState<MasterResidualRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const response = await listMasterResidualRows();
      setData(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: ['foxyflow_Company', 'name'],
      key: 'companyName',
      sorter: (a: MasterResidualRow, b: MasterResidualRow) => 
        a.foxyflow_Company.name.localeCompare(b.foxyflow_Company.name),
    },
    {
      title: 'Rogers Company Name',
      dataIndex: 'foxyflow_rogerscompanyname',
      key: 'rogersCompanyName',
      sorter: (a: MasterResidualRow, b: MasterResidualRow) => 
        a.foxyflow_rogerscompanyname.localeCompare(b.foxyflow_rogerscompanyname),
    },
    {
      title: 'Product',
      dataIndex: 'foxyflow_product',
      key: 'product',
      sorter: (a: MasterResidualRow, b: MasterResidualRow) => 
        (a.foxyflow_product || '').localeCompare(b.foxyflow_product || ''),
    },
    {
      title: 'Billing Number',
      dataIndex: 'foxyflow_billingnumber',
      key: 'billingNumber',
    },
    {
      title: 'Actuals',
      dataIndex: 'foxyflow_actuals',
      key: 'actuals',
      render: (value: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value),
      sorter: (a: MasterResidualRow, b: MasterResidualRow) => 
        a.foxyflow_actuals - b.foxyflow_actuals,
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredData = data.filter(item => {
    const searchValue = searchText.toLowerCase();
    return (
      item.foxyflow_Company.name.toLowerCase().includes(searchValue) ||
      item.foxyflow_rogerscompanyname.toLowerCase().includes(searchValue) ||
      item.foxyflow_billingnumber.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div style={{ padding: '24px' }}>
      <h1>Master Residual List</h1>
      <Search
        placeholder="Search by company name, Rogers company name, or billing number"
        allowClear
        enterButton="Search"
        size="large"
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="foxyflow_residualserviceid"
        scroll={{ x: true }}
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
};

export default MasterResidualList;
