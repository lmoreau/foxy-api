import React from 'react';
import { Table, Empty, Divider, Button, Tabs, Switch, Input, Tooltip, message, DatePicker } from 'antd';
import GroupProtectedRoute from '../GroupProtectedRoute';
import { useIncomingWirelinePayments } from '../../hooks/useIncomingWirelinePayments';
import { useWonServices } from '../../hooks/useWonServices';
import { paymentsColumns } from './paymentsColumns';
import { servicesColumns } from './servicesColumns';
import { resetColorMap } from '../../utils/constants/relationshipColors';
import { updateIncomingPayment } from '../../utils/api';
import '../table.css';
import type { Dayjs } from 'dayjs';

const CRM_BASE_URL = 'https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=';

const { RangePicker } = DatePicker;

const IncomingWirelinePayments: React.FC = () => {
  const {
    allPaymentsData,
    displayedPaymentsData,
    paymentsLoading,
    selectedPaymentId,
    showAllRecords,
    dateRange,
    handleRowSelection,
    toggleShowAll,
    handleDateRangeChange,
  } = useIncomingWirelinePayments();

  const {
    servicesData,
    servicesLoading,
    selectedServiceId,
    handleServiceSelection,
  } = useWonServices(selectedPaymentId, allPaymentsData);

  const [sfdcFilter, setSfdcFilter] = React.useState('');
  const [mapping, setMapping] = React.useState(false);

  // Reset color mappings when data changes
  React.useEffect(() => {
    resetColorMap();
  }, [allPaymentsData, servicesData]);

  const filteredPaymentsData = displayedPaymentsData.filter(payment => 
    payment.foxy_opportunitynumber?.toLowerCase().includes(sfdcFilter.toLowerCase())
  );

  const handleMapClick = async () => {
    if (!selectedPaymentId || !selectedServiceId) return;
    
    setMapping(true);
    try {
      await updateIncomingPayment(selectedPaymentId, selectedServiceId);
      message.success('Successfully mapped payment to service');
      handleRowSelection([]);
      handleServiceSelection([]);
    } catch (error) {
      message.error('Failed to map payment to service');
      console.error('Error mapping payment to service:', error);
    }
    setMapping(false);
  };

  return (
    <GroupProtectedRoute requiredAccess="admin">
      <div style={{ 
        padding: '20px', 
        height: 'calc(100vh - 40px)',
      }}>
        <Tabs
          items={[
            {
              key: '1',
              label: 'Callidus Wireline Payments',
              children: (
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
                  showTable={true}
                  dateRange={dateRange}
                  handleDateRangeChange={handleDateRangeChange}
                />
              ),
            },
            {
              key: '2',
              label: 'Displayed Data',
              children: (
                <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(displayedPaymentsData, null, 2)}
                </pre>
              ),
            },
            {
              key: '3',
              label: 'All Data',
              children: (
                <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(allPaymentsData, null, 2)}
                </pre>
              ),
            },
          ]}
        />

        <Divider style={{ margin: '12px 0' }} />

        {selectedPaymentId && selectedServiceId && (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="primary"
              onClick={handleMapClick}
              loading={mapping}
            >
              Map
            </Button>
          </div>
        )}

        <Tabs
          items={[
            {
              key: '1',
              label: 'Won Services',
              children: (
                <ServicesTable
                  servicesData={servicesData}
                  servicesLoading={servicesLoading}
                  selectedServiceId={selectedServiceId}
                  handleServiceSelection={handleServiceSelection}
                  showTable={true}
                />
              ),
            },
            {
              key: '2',
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
  showTable?: boolean;
  dateRange: [Dayjs, Dayjs];
  handleDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
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
  showTable = false,
  dateRange,
  handleDateRangeChange,
}) => (
  <div>
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {!showTable && <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Incoming Wireline Payments</h2>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RangePicker
            onChange={(dates) => handleDateRangeChange(dates as [Dayjs, Dayjs] | null)}
            value={dateRange}
            style={{ width: 300 }}
            allowClear={false}
          />
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
    </div>
  </div>
);

const ServicesTable: React.FC<{
  servicesData: any[];
  servicesLoading: boolean;
  selectedServiceId: string | null;
  handleServiceSelection: (selectedRowKeys: React.Key[]) => void;
  showTable?: boolean;
}> = ({ servicesData, servicesLoading, selectedServiceId, handleServiceSelection, showTable = false }) => {
  const firstService = servicesData[0];
  
  const headerDetails = firstService && (
    <div style={{ 
      marginTop: '8px',
      display: 'flex',
      gap: '24px',
      fontSize: '14px',
      color: '#666',
      alignItems: 'center'
    }}>
      {firstService.foxy_Opportunity?.foxy_sfdcoppid && (
        <div>
          <strong>SFDC Opp:</strong> {firstService.foxy_Opportunity.foxy_sfdcoppid}
        </div>
      )}
      {firstService.foxy_Account?.name && (
        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={firstService.foxy_Account.name}>
            <span>
              <strong>Company:</strong> {firstService.foxy_Account.name}
            </span>
          </Tooltip>
        </div>
      )}
      {firstService.foxy_Opportunity?.name && (
        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={firstService.foxy_Opportunity.name}>
            <a
              href={`${CRM_BASE_URL}${firstService.foxy_Opportunity.opportunityid}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1890ff' }}
            >
              <strong>Opportunity:</strong> {firstService.foxy_Opportunity.name}
            </a>
          </Tooltip>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        {!showTable && <h2 style={{ fontSize: '24px', margin: '0' }}>Won Services</h2>}
        {headerDetails}
        <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
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
      </div>
    </div>
  );
}

export default IncomingWirelinePayments;
