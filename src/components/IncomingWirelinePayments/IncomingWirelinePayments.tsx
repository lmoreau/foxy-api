import React from 'react';
import { Table, Empty, Divider, Button } from 'antd';
import GroupProtectedRoute from '../GroupProtectedRoute';
import { useIncomingWirelinePayments } from '../../hooks/useIncomingWirelinePayments';
import { useWonServices } from '../../hooks/useWonServices';
import { paymentsColumns } from './paymentsColumns';
import { servicesColumns } from './servicesColumns';
import '../table.css';

const IncomingWirelinePayments: React.FC = () => {
  const {
    allPaymentsData,
    displayedPaymentsData,
    paymentsLoading,
    selectedPaymentId,
    handleRowSelection,
  } = useIncomingWirelinePayments();

  const {
    servicesData,
    servicesLoading,
    selectedServiceId,
    handleServiceSelection,
  } = useWonServices(selectedPaymentId, allPaymentsData);

  return (
    <GroupProtectedRoute requiredAccess="admin">
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px', height: 'calc(100vh - 40px)' }}>
        <PaymentsTable
          displayedPaymentsData={displayedPaymentsData}
          paymentsLoading={paymentsLoading}
          selectedPaymentId={selectedPaymentId}
          handleRowSelection={handleRowSelection}
          allPaymentsData={allPaymentsData}
        />

        <Divider style={{ margin: 0 }} />

        <ServicesTable
          servicesData={servicesData}
          servicesLoading={servicesLoading}
          selectedServiceId={selectedServiceId}
          handleServiceSelection={handleServiceSelection}
        />
      </div>
    </GroupProtectedRoute>
  );
};

const PaymentsTable: React.FC<{
  displayedPaymentsData: any[];
  paymentsLoading: boolean;
  selectedPaymentId: string | null;
  handleRowSelection: (selectedRowKeys: React.Key[]) => void;
  allPaymentsData: any[];
}> = ({ displayedPaymentsData, paymentsLoading, selectedPaymentId, handleRowSelection, allPaymentsData }) => (
  <div style={{ height: '400px' }}>
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Incoming Wireline Payments</h2>
      <div style={{ color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>
          Displaying {displayedPaymentsData.length} {displayedPaymentsData.length === 1 ? 'payment' : 'payments'}
          {selectedPaymentId && displayedPaymentsData.length < allPaymentsData.length && 
            ` (filtered by SFDC Opp ID)`}
        </span>
        {selectedPaymentId && (
          <Button 
            size="small"
            onClick={() => handleRowSelection([])}
          >
            Clear Selection
          </Button>
        )}
      </div>
    </div>
    <div className="rounded-table" style={{ height: 'calc(100% - 60px)' }}>
      <Table
        columns={paymentsColumns}
        dataSource={displayedPaymentsData}
        loading={paymentsLoading}
        rowKey="foxy_incomingpaymentid"
        scroll={{ x: 'max-content', y: 300 }}
        size="small"
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedPaymentId ? [selectedPaymentId] : [],
          onChange: handleRowSelection
        }}
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
);

const ServicesTable: React.FC<{
  servicesData: any[];
  servicesLoading: boolean;
  selectedServiceId: string | null;
  handleServiceSelection: (selectedRowKeys: React.Key[]) => void;
}> = ({ servicesData, servicesLoading, selectedServiceId, handleServiceSelection }) => (
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
        scroll={{ x: 'max-content', y: 300 }}
        size="small"
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedServiceId ? [selectedServiceId] : [],
          onChange: handleServiceSelection
        }}
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
);

export default IncomingWirelinePayments;
