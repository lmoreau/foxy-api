import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Statistic } from 'antd';
import { DeleteOutlined, PlusOutlined, DollarOutlined } from '@ant-design/icons';
import QuoteLineItemsTable from './QuoteLineItemsTable';
import { QuoteLocation, QuoteLineItem } from '../types';
import { createNewLineItem, calculateTotals } from '../utils/quoteUtils';

const { Text } = Typography;

interface LocationsTableProps {
  data: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  onAddLine: (locationId: string, newItem: QuoteLineItem) => void;
  expandAll: boolean;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  data,
  lineItems,
  onAddLine,
  expandAll,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (expandAll) {
      setExpandedRowKeys(data.map(location => location.foxy_foxyquoterequestlocationid));
    } else {
      setExpandedRowKeys([]);
    }
  }, [expandAll, data]);

  const columns = [
    {
      title: 'Quote Location',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      render: (text: string, record: QuoteLocation) => {
        const locationLineItems = lineItems[record.foxy_foxyquoterequestlocationid] || [];
        const { totalMRR, totalTCV } = calculateTotals({ [record.foxy_foxyquoterequestlocationid]: locationLineItems });
        const isExpanded = expandedRowKeys.includes(record.foxy_foxyquoterequestlocationid);
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>{text}</Text>
            <Space size="large" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              {isExpanded ? (
                <Space>
                  <Button icon={<DeleteOutlined />} type="default" disabled>
                    Delete Row
                  </Button>
                  <Button 
                    icon={<PlusOutlined />} 
                    type="primary"
                    onClick={() => onAddLine(record.foxy_foxyquoterequestlocationid, createNewLineItem())}
                  >
                    Add Product
                  </Button>
                </Space>
              ) : (
                <Space size="large">
                  <Statistic 
                    title="MRR" 
                    value={totalMRR} 
                    prefix={<DollarOutlined />} 
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Statistic 
                    title="TCV" 
                    value={totalTCV} 
                    prefix={<DollarOutlined />} 
                    precision={2}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Space>
              )}
            </Space>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="foxy_foxyquoterequestlocationid"
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange: (newExpandedRows) => {
          setExpandedRowKeys(newExpandedRows as string[]);
        },
        expandedRowRender: (record) => (
          <QuoteLineItemsTable
            initialLineItems={lineItems[record.foxy_foxyquoterequestlocationid] || []}
          />
        ),
        rowExpandable: (record) => lineItems[record.foxy_foxyquoterequestlocationid]?.length > 0,
      }}
      showHeader={false}
      size="small"
    />
  );
};

export default LocationsTable;
