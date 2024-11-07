import React, { useState, useEffect } from 'react';
import { Table, Empty } from 'antd';
import { useIsAuthenticated } from "@azure/msal-react";
import { listIncomingWirelinePayments } from '../utils/api';
import { IncomingWirelinePayment } from '../types/wirelinePayments';
import GroupProtectedRoute from './GroupProtectedRoute';
import './table.css';

const IncomingWirelinePaymentsContent: React.FC = () => {
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
      ellipsis: true,
    },
    {
      title: 'Company',
      dataIndex: 'foxy_companyname',
      key: 'company',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_companyname || '').localeCompare(b.foxy_companyname || ''),
      ellipsis: true,
    },
    {
      title: 'Product',
      dataIndex: 'foxy_productname',
      key: 'product',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_productname || '').localeCompare(b.foxy_productname || ''),
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'foxy_productdescription',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Site',
      dataIndex: 'foxy_opticsite',
      key: 'site',
      ellipsis: true,
    },
    {
      title: 'Payment Date',
      dataIndex: 'foxy_paymentdate',
      key: 'paymentDate',
      render: (date: string) => formatDate(date),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        new Date(a.foxy_paymentdate).getTime() - new Date(b.foxy_paymentdate).getTime(),
      ellipsis: true,
    },
    {
      title: 'Payment Amount',
      dataIndex: 'foxy_paymentamount',
      key: 'paymentAmount',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_paymentamount || 0) - (b.foxy_paymentamount || 0),
      ellipsis: true,
    },
    {
      title: 'Existing MRR',
      dataIndex: 'foxy_existingmrr',
      key: 'existingMrr',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_existingmrr || 0) - (b.foxy_existingmrr || 0),
      ellipsis: true,
    },
    {
      title: 'New MRR',
      dataIndex: 'foxy_newmrr',
      key: 'newMrr',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_newmrr || 0) - (b.foxy_newmrr || 0),
      ellipsis: true,
    },
    {
      title: 'Net New TCV',
      dataIndex: 'foxy_netnewtcv',
      key: 'netNewTcv',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_netnewtcv || 0) - (b.foxy_netnewtcv || 0),
      ellipsis: true,
    },
    {
      title: 'Revenue Type',
      dataIndex: 'foxy_revenuetype',
      key: 'revenueType',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_revenuetype || '').localeCompare(b.foxy_revenuetype || ''),
      ellipsis: true,
    },
    {
      title: 'Term',
      dataIndex: 'foxy_term',
      key: 'term',
      ellipsis: true,
    },
    {
      title: 'Margin',
      dataIndex: 'foxy_margin',
      key: 'margin',
      render: (value: number) => formatPercentage(value),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_margin || 0) - (b.foxy_margin || 0),
      ellipsis: true,
    },
    {
      title: 'Renewal Rate',
      dataIndex: 'foxy_renewalrate',
      key: 'renewalRate',
      render: (value: number) => formatPercentage(value),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_renewalrate || 0) - (b.foxy_renewalrate || 0),
      ellipsis: true,
    },
    {
      title: 'Net New Rate',
      dataIndex: 'foxy_netnewrate',
      key: 'netNewRate',
      render: (value: number) => formatPercentage(value),
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_netnewrate || 0) - (b.foxy_netnewrate || 0),
      ellipsis: true,
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Incoming Wireline Payments</h2>
      <div style={{ color: '#666', fontSize: '14px', marginTop: '-8px', marginBottom: '16px' }}>
        Displaying {data.length} {data.length === 1 ? 'payment' : 'payments'}
      </div>
      <div className="rounded-table">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="foxy_incomingpaymentid"
          scroll={{ x: true }}
          size="small"
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
    </div>
  );
};

// Wrap the component with GroupProtectedRoute
const IncomingWirelinePayments: React.FC = () => (
  <GroupProtectedRoute requiredAccess="full">
    <IncomingWirelinePaymentsContent />
  </GroupProtectedRoute>
);

export default IncomingWirelinePayments;
