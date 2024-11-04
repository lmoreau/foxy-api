import React, { useState, useMemo } from 'react';
import { Table, Tag, Tooltip, Switch, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRecord, WirelineRecord, ResidualRecord, MergedRecord } from '../types/residualTypes';
import DescriptionProductColumn from './DescriptionProductColumn';

interface ResidualTableProps {
  data: TableRecord[];
  showUnmerged?: boolean;
  onToggleUnmerged?: (checked: boolean) => void;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

const DateRange: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDateObj = new Date(endDate);
  endDateObj.setHours(0, 0, 0, 0);
  const endDateColor = endDateObj < today ? 'red' : 'green';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tag color="blue">{formatDate(startDate)}</Tag>
      <span style={{ 
        color: '#666', 
        margin: '0 4px',
        display: 'flex',
        alignItems: 'center'
      }}>
        ⟶
      </span>
      <Tag color={endDateColor}>{formatDate(endDate)}</Tag>
    </div>
  );
};

export const ResidualTable: React.FC<ResidualTableProps> = ({ data, showUnmerged, onToggleUnmerged }) => {
  const allParentKeys = useMemo(() => 
    data.filter(record => 'children' in record).map(record => record.key)
  , [data]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>(allParentKeys);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleExpandToggle = (checked: boolean) => {
    setIsCollapsed(checked);
    setExpandedRowKeys(checked ? [] : allParentKeys);
  };

  const handleExpandedRowsChange = (keys: readonly React.Key[]) => {
    setExpandedRowKeys([...keys]);
    setIsCollapsed(keys.length === 0);
  };

  const getTotalsDifference = (residualTotal: number, wirelineTotal: number) => {
    if (wirelineTotal === 0) return "No wireline records found";
    if (residualTotal === 0) return "No residual records found";
    
    const diff = residualTotal - wirelineTotal;
    if (diff > 0) {
      return <>Residuals are <span style={{ fontWeight: 'bold' }}>{diff.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span> higher</>;
    } else {
      return <>Wireline is <span style={{ fontWeight: 'bold' }}>{Math.abs(diff).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span> higher</>;
    }
  };

  const columns: ColumnsType<TableRecord> = [
    {
      title: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Description/Product</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            {onToggleUnmerged && (
              <>
                <Switch 
                  size="small"
                  checked={showUnmerged}
                  onChange={onToggleUnmerged}
                />
                <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                  De-merge Records
                </span>
              </>
            )}
            <Switch 
              size="small"
              checked={isCollapsed}
              onChange={handleExpandToggle}
            />
            <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
              {isCollapsed ? 'Expand All' : 'Collapse All'}
            </span>
          </div>
        </div>
      ),
      key: 'description',
      width: '45%',
      render: (_, record, index) => {
        if ('children' in record) {
          const residualTotal = record.totalResidualAmount;
          const wirelineTotal = record.totalWirelineCharges;
          const totalsMatch = Math.abs(residualTotal - wirelineTotal) < 0.01;

          return {
            children: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontWeight: 'bold' }}>
                  <span style={{ color: '#1890ff' }}>{record.accountId}</span>
                  {' - '}
                  <span>{record.companyName}</span>
                </div>
                {totalsMatch ? (
                  <Tag color="purple">
                    Matched Total: <span style={{ fontWeight: 'bold' }}>{residualTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </Tag>
                ) : (
                  <>
                    <Tag color="blue">
                      Residual Total: <span style={{ fontWeight: 'bold' }}>{residualTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </Tag>
                    <Tag color="green">
                      Wireline Total: <span style={{ fontWeight: 'bold' }}>{wirelineTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </Tag>
                    <Tag color="orange">
                      {getTotalsDifference(residualTotal, wirelineTotal)}
                    </Tag>
                  </>
                )}
              </div>
            ),
            props: {
              colSpan: 5,
              style: { backgroundColor: '#fafafa' }
            }
          };
        }

        return <DescriptionProductColumn record={record} />;
      },
    },
    {
      title: 'Service Details',
      key: 'serviceDetails',
      width: '15%',
      render: (_, record) => {
        if ('children' in record) return null;

        const isMerged = record.type === 'merged';
        const isWireline = record.type === 'wireline';
        const mergedRecord = record as MergedRecord;
        const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
        const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

        if (isMerged || isWireline) {
          const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
          return (
            r.foxy_addressline1 && (
              <Tooltip title={`${r.foxy_addressline1}, ${r.foxy_city}, ${r.foxy_province} ${r.foxy_postalcode}`}>
                {`${r.foxy_addressline1}, ${r.foxy_city}, ${r.foxy_province}`}
              </Tooltip>
            )
          );
        }

        return residualRecord ? (
          <>
            Code: {residualRecord.foxyflow_charge_item_code}
          </>
        ) : null;
      },
    },
    {
      title: 'Contract Start/End',
      key: 'dates',
      width: '25%',
      render: (_, record) => {
        if ('children' in record) return null;

        const isMerged = record.type === 'merged';
        const isWireline = record.type === 'wireline';
        const mergedRecord = record as MergedRecord;
        const wirelineRecord = isWireline ? record as WirelineRecord : undefined;

        if (isMerged || isWireline) {
          const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
          return (
            <DateRange 
              startDate={r.foxy_billingeffectivedate}
              endDate={r.foxy_estimatedenddate}
            />
          );
        }

        return null;
      },
    },
    {
      title: 'Site Name',
      key: 'company',
      width: '15%',
      render: (_, record) => {
        if ('children' in record) return null;

        const isMerged = record.type === 'merged';
        const isWireline = record.type === 'wireline';
        const mergedRecord = record as MergedRecord;
        const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
        const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

        if (isMerged || isWireline) {
          const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
          return r.foxy_sitename;
        }

        return residualRecord ? residualRecord.foxyflow_rogerscompanyname : null;
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      width: '10%',
      render: (_, record) => {
        if ('children' in record) return null;

        const isMerged = record.type === 'merged';
        const isWireline = record.type === 'wireline';
        const mergedRecord = record as MergedRecord;
        const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
        const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

        let value: string | undefined;
        if (isMerged) {
          value = mergedRecord.wirelineRecord.foxy_charges;
        } else if (isWireline) {
          value = wirelineRecord!.foxy_charges;
        } else if (residualRecord) {
          value = residualRecord.foxyflow_actuals;
        }

        if (!value) return null;
        const num = parseFloat(value.toString());
        
        let tagColor = 'blue';
        let tagText = '';
        
        if (isMerged) {
          const isAutoMerged = mergedRecord.isAutoMerged;
          tagColor = isAutoMerged ? 'blue' : 'purple';
          tagText = isAutoMerged ? 'Auto-Merged' : 'Merged';
        } else if (isWireline) {
          tagColor = 'green';
          tagText = 'Wireline';
        } else {
          tagColor = 'blue';
          tagText = 'Residual';
        }

        return (
          <div>
            <Tag color={tagColor} style={{ fontWeight: 'bold' }}>
              {num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </Tag>
            <Tag color={tagColor}>{tagText}</Tag>
          </div>
        );
      },
    }
  ];

  const { processedData, showMatchAlert, hasAutoMerged } = useMemo(() => {
    const processed = data.map(accountGroup => {
      if (!('children' in accountGroup)) return accountGroup;

      // Sort children to put merged records first, then sort by amount within each type
      const sortedChildren = [...accountGroup.children].sort((a, b) => {
        const aIsMerged = a.type === 'merged';
        const bIsMerged = b.type === 'merged';
        
        if (aIsMerged && !bIsMerged) return -1;
        if (!aIsMerged && bIsMerged) return 1;
        
        // If both are merged or both are not merged, sort by amount
        const aAmount = parseFloat(a.type === 'merged' ? (a as MergedRecord).wirelineRecord.foxy_charges : 
                      a.type === 'wireline' ? (a as WirelineRecord).foxy_charges :
                      (a as ResidualRecord).foxyflow_actuals) || 0;
        const bAmount = parseFloat(b.type === 'merged' ? (b as MergedRecord).wirelineRecord.foxy_charges :
                      b.type === 'wireline' ? (b as WirelineRecord).foxy_charges :
                      (b as ResidualRecord).foxyflow_actuals) || 0;
        
        return bAmount - aAmount;
      });

      return {
        ...accountGroup,
        children: sortedChildren
      };
    });

    // Check if there are rows and totals match
    const hasMatchingTotals = processed.every(group => {
      if (!('children' in group)) return false;
      return group.children.length > 0 && 
             Math.abs(group.totalResidualAmount - group.totalWirelineCharges) < 0.01;
    });

    // Check if any records are auto-merged
    const autoMerged = processed.some(group => {
      if (!('children' in group)) return false;
      return group.hasAutoMerged;
    });

    // Only show alert if there are rows and totals match
    const showAlert = processed.some(group => 'children' in group && group.children.length > 0) && hasMatchingTotals;

    return {
      processedData: processed,
      showMatchAlert: showAlert,
      hasAutoMerged: autoMerged
    };
  }, [data]);

  return (
    <>
      {showMatchAlert && (
        <Alert
          message={hasAutoMerged ? "Some records have been automatically mapped based on matching amounts. Use the De-merge toggle to review individual records." : "Perfect Match!"}
          type={hasAutoMerged ? "info" : "success"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Table
        columns={columns}
        dataSource={processedData}
        rowKey="key"
        pagination={false}
        scroll={{ x: 1500 }}
        size="middle"
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: handleExpandedRowsChange
        }}
      />
      <style>
        {`
          .ant-table-row-expand-icon-cell {
            padding-right: 0 !important;
          }
          .ant-table {
            border-radius: 8px !important;
          }
          .ant-table-container {
            border-radius: 8px !important;
            overflow: hidden;
          }
          .ant-table-content {
            border-radius: 8px !important;
          }
          .ant-table-body {
            border-radius: 0 0 8px 8px !important;
          }
          .ant-table-wrapper .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }
        `}
      </style>
    </>
  );
}
