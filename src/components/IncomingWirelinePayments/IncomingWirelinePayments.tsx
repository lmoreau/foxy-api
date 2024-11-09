import React from 'react';
import { Table, Empty, Divider, Button, Tabs, Switch, Input } from 'antd';
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
    showAllRecords,
    handleRowSelection,
    toggleShowAll,
  } = useIncomingWirelinePayments();

  const {
    servicesData,
    servicesLoading,
    selectedServiceId,
    handleServiceSelection,
  } = useWonServices(selectedPaymentId, allPaymentsData);

  const [sfdcFilter, setSfdcFilter] = React.useState('');

  const filteredPaymentsData = displayedPaymentsData.filter(payment => 
    payment.foxy_opportunitynumber?.toLowerCase().includes(sfdcFilter.toLowerCase())
  );

  return (
    <GroupProtectedRoute requiredAccess="admin">
      <div style={{ 
        padding: '20px', 
        height: 'calc(100vh - 40px)',
      }}>
        <PaymentsTable
          displayedPaymentsData={filteredPaymentsData}
          paymentsLoading={paymentsLoading}
          selectedPaymentId={selectedPaymentId}
          handleRowSelection={handleRowSelection}
          allPaymentsData={allPaymentsData}
          showAllRecords={showAllRecords}
          toggleShowAll={toggleShowAll}
          sfdcFilter={sfdcFilter}
          setSfdcFilter={setSfdcFilter}
        />

        <Divider style={{ margin: '12px 0' }} />

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
  showAllRecords: boolean;
  toggleShowAll: () => void;
  sfdcFilter: string;
  setSfdcFilter: (value: string) => void;
}> = ({ 
  displayedPaymentsData, 
  paymentsLoading, 
  selectedPaymentId, 
  handleRowSelection, 
  allPaymentsData,
  showAllRecords,
  toggleShowAll,
  sfdcFilter,
  setSfdcFilter,
}) => (
  <div>
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Incoming Wireline Payments</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            placeholder="Filter by SFDC Opp"
            value={sfdcFilter}
            onChange={(e) => setSfdcFilter(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <span style={{ color: '#666', fontSize: '14px' }}>Show All Records</span>
          <Switch
            checked={showAllRecords}
            onChange={toggleShowAll}
            size="small"
          />
        </div>
      </div>
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
    <div className="rounded-table">
      <Table
        columns={paymentsColumns}
        dataSource={displayedPaymentsData}
        loading={paymentsLoading}
        rowKey="foxy_incomingpaymentid"
        scroll={{ x: 'max-content', y: '35vh' }}
        size="small"
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedPaymentId ? [selectedPaymentId] : [],
          onChange: handleRowSelection
        }}
        pagination={false}
        locale={{
          emptyText: <Empty description="No records found" />
        }}
      />
      <Tabs
        items={[
          {
            key: '1',
            label: 'Displayed Data',
            children: (
              <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(displayedPaymentsData, null, 2)}
              </pre>
            ),
          },
          {
            key: '2',
            label: 'All Data',
            children: (
              <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(allPaymentsData, null, 2)}
              </pre>
            ),
          },
        ]}
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
  <div>
    <div style={{ marginBottom: '4px' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Won Services</h2>
      <div style={{ color: '#666', fontSize: '14px' }}>
        Displaying {servicesData.length} {servicesData.length === 1 ? 'service' : 'services'}
      </div>
    </div>
    <div className="rounded-table">
      <Table
        columns={servicesColumns}
        dataSource={servicesData}
        loading={servicesLoading}
        rowKey="foxy_wonserviceid"
        scroll={{ x: 'max-content', y: '35vh' }}
        size="small"
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedServiceId ? [selectedServiceId] : [],
          onChange: handleServiceSelection
        }}
        pagination={false}
        locale={{
          emptyText: <Empty description="No records found" />
        }}
      />
      <Tabs
        items={[
          {
            key: '1',
            label: 'Services Data',
            children: (
              <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(servicesData, null, 2)}
              </pre>
            ),
          },
        ]}
      />
    </div>
  </div>
);

export default IncomingWirelinePayments;
