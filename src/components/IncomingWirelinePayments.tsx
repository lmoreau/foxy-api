import React, { useState, useEffect } from 'react';
import { Table, Empty, Divider } from 'antd';
import { useIsAuthenticated } from "@azure/msal-react";
import { listIncomingWirelinePayments, listWonServices } from '../utils/api';
import { IncomingWirelinePayment } from '../types/wirelinePayments';
import { WonService } from '../types/wonServices';
import GroupProtectedRoute from './GroupProtectedRoute';
import './table.css';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';

const IncomingWirelinePayments: React.FC = () => {
  const [paymentsData, setPaymentsData] = useState<IncomingWirelinePayment[]>([]);
  const [servicesData, setServicesData] = useState<WonService[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const fetchPaymentsData = async () => {
      if (!isAuthenticated) return;
      
      setPaymentsLoading(true);
      try {
        const response = await listIncomingWirelinePayments();
        setPaymentsData(response);
      } catch (error) {
        console.error('Error fetching payments data:', error);
      } finally {
        setPaymentsLoading(false);
      }
    };

    const fetchServicesData = async () => {
      if (!isAuthenticated) return;
      
      setServicesLoading(true);
      try {
        const response = await listWonServices('2023-01-01', '2025-01-01');
        setServicesData(response.value || []);
      } catch (error) {
        console.error('Error fetching services data:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchPaymentsData();
    fetchServicesData();
  }, [isAuthenticated]);

  const paymentsColumns = [
    {
      title: 'SFDC Opp ID',
      dataIndex: 'foxy_opportunitynumber',
      key: 'sfdcOppId',
      sorter: (a: IncomingWirelinePayment, b: IncomingWirelinePayment) => 
        (a.foxy_opportunitynumber || '').localeCompare(b.foxy_opportunitynumber || ''),
      ellipsis: true,
    },
    {
      title: 'Order Number',
      dataIndex: 'crc9f_ordernumber',
      key: 'orderNumber',
      ellipsis: true,
    },
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

  const servicesColumns = [
    {
      title: 'SFDC Opp ID',
      dataIndex: ['foxy_Opportunity', 'foxy_sfdcoppid'],
      key: 'sfdcOppId',
      sorter: (a: WonService, b: WonService) => 
        ((a.foxy_Opportunity?.foxy_sfdcoppid || '') as string).localeCompare((b.foxy_Opportunity?.foxy_sfdcoppid || '') as string),
      ellipsis: true,
    },
    {
      title: 'Existing MRR',
      dataIndex: 'crc9f_existingmrr',
      key: 'existingMrr',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: WonService, b: WonService) => 
        (a.crc9f_existingmrr || 0) - (b.crc9f_existingmrr || 0),
      ellipsis: true,
    },
    {
      title: 'Renewal Disposition',
      dataIndex: 'foxy_renewaldisposition',
      key: 'renewalDisposition',
      ellipsis: true,
    },
    {
      title: 'Status Code',
      dataIndex: 'statuscode',
      key: 'statusCode',
      ellipsis: true,
    },
    {
      title: 'Infusion Payment Status',
      dataIndex: 'foxy_infusionpaymentstatus',
      key: 'infusionPaymentStatus',
      ellipsis: true,
    },
    {
      title: 'Renewal Type',
      dataIndex: 'foxy_renewaltype',
      key: 'renewalType',
      ellipsis: true,
    },
    {
      title: 'Access',
      dataIndex: 'foxy_access',
      key: 'access',
      ellipsis: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'foxy_quantity',
      key: 'quantity',
      ellipsis: true,
    },
    {
      title: 'MRR',
      dataIndex: 'foxy_mrr',
      key: 'mrr',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: WonService, b: WonService) => 
        (a.foxy_mrr || 0) - (b.foxy_mrr || 0),
      ellipsis: true,
    },
    {
      title: 'TCV',
      dataIndex: 'foxy_tcv',
      key: 'tcv',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: WonService, b: WonService) => 
        (a.foxy_tcv || 0) - (b.foxy_tcv || 0),
      ellipsis: true,
    },
    {
      title: 'Comp Rate',
      dataIndex: 'foxy_comprate',
      key: 'compRate',
      render: (value: number) => formatPercentage(value),
      sorter: (a: WonService, b: WonService) => 
        (a.foxy_comprate || 0) - (b.foxy_comprate || 0),
      ellipsis: true,
    },
    {
      title: 'Won Service ID',
      dataIndex: 'foxy_wonserviceid',
      key: 'wonServiceId',
      ellipsis: true,
    },
    {
      title: 'Service ID',
      dataIndex: 'foxy_serviceid',
      key: 'serviceId',
      ellipsis: true,
    },
    {
      title: 'SO Line',
      dataIndex: 'foxy_sololine',
      key: 'soLine',
      ellipsis: true,
    },
    {
      title: 'State Code',
      dataIndex: 'statecode',
      key: 'stateCode',
      ellipsis: true,
    },
    {
      title: 'Revenue Type',
      dataIndex: 'foxy_revenuetype',
      key: 'revenueType',
      ellipsis: true,
    },
    {
      title: 'Line Margin',
      dataIndex: 'foxy_linemargin',
      key: 'lineMargin',
      render: (value: number) => formatPercentage(value),
      sorter: (a: WonService, b: WonService) => 
        (a.foxy_linemargin || 0) - (b.foxy_linemargin || 0),
      ellipsis: true,
    },
    {
      title: 'Term',
      dataIndex: 'foxy_term',
      key: 'term',
      ellipsis: true,
    },
    {
      title: 'In Payment Status',
      dataIndex: 'foxy_inpaymentstatus',
      key: 'inPaymentStatus',
      ellipsis: true,
    },
    {
      title: 'MRR Uptick',
      dataIndex: 'foxy_mrruptick',
      key: 'mrrUptick',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: WonService, b: WonService) => 
        (a.foxy_mrruptick || 0) - (b.foxy_mrruptick || 0),
      ellipsis: true,
    },
    {
      title: 'Expected Comp',
      dataIndex: 'foxy_expectedcomp',
      key: 'expectedComp',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: WonService, b: WonService) => 
        (a.foxy_expectedcomp || 0) - (b.foxy_expectedcomp || 0),
      ellipsis: true,
    },
    {
      title: 'Product',
      dataIndex: ['foxy_Product', 'name'],
      key: 'product',
      ellipsis: true,
    },
    {
      title: 'Account',
      dataIndex: ['foxy_Account', 'name'],
      key: 'account',
      ellipsis: true,
    },
    {
      title: 'Opportunity',
      dataIndex: ['foxy_Opportunity', 'name'],
      key: 'opportunity',
      ellipsis: true,
    },
    {
      title: 'Account Location',
      dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
      key: 'accountLocation',
      ellipsis: true,
    },
  ];

  return (
    <GroupProtectedRoute requiredAccess="admin">
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px', height: 'calc(100vh - 40px)' }}>
        {/* Incoming Wireline Payments Section */}
        <div style={{ height: '400px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Incoming Wireline Payments</h2>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Displaying {paymentsData.length} {paymentsData.length === 1 ? 'payment' : 'payments'}
            </div>
          </div>
          <div className="rounded-table" style={{ height: 'calc(100% - 60px)' }}>
            <Table
              columns={paymentsColumns}
              dataSource={paymentsData}
              loading={paymentsLoading}
              rowKey="foxy_incomingpaymentid"
              scroll={{ x: true, y: 300 }}
              size="small"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              locale={{
                emptyText: <Empty description="No records found" />
              }}
            />
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Won Services Section */}
        <div style={{ height: '400px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Won Services</h2>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Displaying {servicesData.length} {servicesData.length === 1 ? 'service' : 'services'}
            </div>
          </div>
          <div className="rounded-table" style={{ height: 'calc(100% - 60px)' }}>
            <Table
              columns={servicesColumns}
              dataSource={servicesData}
              loading={servicesLoading}
              rowKey="foxy_wonserviceid"
              scroll={{ x: true, y: 300 }}
              size="small"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              locale={{
                emptyText: <Empty description="No records found" />
              }}
            />
          </div>
        </div>
      </div>
    </GroupProtectedRoute>
  );
};

export default IncomingWirelinePayments;
