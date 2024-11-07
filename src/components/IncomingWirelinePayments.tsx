import React, { useState, useEffect } from 'react';
import { Table, Empty } from 'antd';
import { useIsAuthenticated } from "@azure/msal-react";
import { listIncomingWirelinePayments } from '../utils/api';
import { IncomingWirelinePayment } from '../types/wirelinePayments';

const IncomingWirelinePayments: React.FC = () => {
  const [data, setData] = useState<IncomingWirelinePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        const response = await listIncomingWirelinePayments();
        setData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'foxy_name',
      key: 'paymentId',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_name || '').localeCompare(b.foxy_name || ''),
    },
    {
      title: 'Company',
      dataIndex: 'foxy_companyname',
      key: 'company',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_companyname || '').localeCompare(b.foxy_companyname || ''),
    },
    {
      title: 'Product',
      dataIndex: 'foxy_productname',
      key: 'product',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_productname || '').localeCompare(b.foxy_productname || ''),
    },
    {
      title: 'Description',
      dataIndex: 'foxy_productdescription',
      key: 'description',
    },
    {
      title: 'Site',
      dataIndex: 'foxy_opticsite',
      key: 'site',
    },
    {
      title: 'Payment Date',
      dataIndex: 'foxy_paymentdate',
      key: 'paymentDate',
      render: (date: string) => formatDate(date),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        new Date(a.foxy_paymentdate).getTime() - new Date(b.foxy_paymentdate).getTime(),
    },
    {
      title: 'Payment Amount',
      dataIndex: 'foxy_paymentamount',
      key: 'paymentAmount',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_paymentamount || 0) - (b.foxy_paymentamount || 0),
    },
    {
      title: 'Existing MRR',
      dataIndex: 'foxy_existingmrr',
      key: 'existingMrr',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_existingmrr || 0) - (b.foxy_existingmrr || 0),
    },
    {
      title: 'New MRR',
      dataIndex: 'foxy_newmrr',
      key: 'newMrr',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_newmrr || 0) - (b.foxy_newmrr || 0),
    },
    {
      title: 'Net New TCV',
      dataIndex: 'foxy_netnewtcv',
      key: 'netNewTcv',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_netnewtcv || 0) - (b.foxy_netnewtcv || 0),
    },
    {
      title: 'Revenue Type',
      dataIndex: 'foxy_revenuetype',
      key: 'revenueType',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_revenuetype || '').localeCompare(b.foxy_revenuetype || ''),
    },
    {
      title: 'Term',
      dataIndex: 'foxy_term',
      key: 'term',
    },
    {
      title: 'Margin',
      dataIndex: 'foxy_margin',
      key: 'margin',
      render: (value: number) => formatPercentage(value),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_margin || 0) - (b.foxy_margin || 0),
    },
    {
      title: 'Renewal Rate',
      dataIndex: 'foxy_renewalrate',
      key: 'renewalRate',
      render: (value: number) => formatPercentage(value),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_renewalrate || 0) - (b.foxy_renewalrate || 0),
    },
    {
      title: 'Net New Rate',
      dataIndex: 'foxy_netnewrate',
      key: 'netNewRate',
      render: (value: number) => formatPercentage(value),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_netnewrate || 0) - (b.foxy_netnewrate || 0),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Incoming Wireline Payments</h1>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="foxy_incomingpaymentid"
        scroll={{ x: true }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        locale={{
          emptyText: <Empty description="No records found" />
        }}
      />
    </div>
  );
};

export default IncomingWirelinePayments;
