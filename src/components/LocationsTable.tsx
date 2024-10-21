import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Statistic, Row, Col } from 'antd';
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
          <Row align="middle" justify="space-between" style={{ width: '100%' }}>
            <Col>
              <Space direction="vertical" size="small">
                <Text strong>{text}</Text>
                {!isExpanded && (
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
            </Col>
            <Col>
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
            </Col>
          </Row>
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
