import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Statistic, Row, Col, Modal, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, DollarOutlined, ThunderboltOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import QuoteLineItemsTable from './QuoteLineItemsTable';
import { QuoteLocation, QuoteLineItem } from '../types';
import { createNewLineItem, calculateTotals } from '../utils/quoteUtils';

const { Text } = Typography;

interface LocationsTableProps {
  data: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  onAddLine: (locationId: string, newItem: QuoteLineItem) => void;
  onUpdateLineItem: (locationId: string, updatedItem: QuoteLineItem) => void;
  onDeleteLineItem: (locationId: string, itemId: string) => void;
  expandAll: boolean;
  onDeleteLocation: (locationId: string) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  data,
  lineItems,
  onAddLine,
  onUpdateLineItem,
  onDeleteLineItem,
  expandAll,
  onDeleteLocation,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [addingProductToLocation, setAddingProductToLocation] = useState<string | null>(null);

  useEffect(() => {
    if (expandAll) {
      setExpandedRowKeys(data.map(location => location.foxy_foxyquoterequestlocationid));
    } else {
      setExpandedRowKeys([]);
    }
  }, [expandAll, data]);

  const handleDeleteClick = (locationId: string) => {
    setLocationToDelete(locationId);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (locationToDelete) {
      try {
        await onDeleteLocation(locationToDelete);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
    setDeleteModalVisible(false);
    setLocationToDelete(null);
  };

  const handleAddProduct = (locationId: string) => {
    setAddingProductToLocation(locationId);
  };

  const columns = [
    {
      title: 'Location',
      dataIndex: ['foxy_Building', 'foxy_fulladdress'],
      key: 'location',
      render: (text: string, record: QuoteLocation) => {
        const locationLineItems = lineItems[record.foxy_foxyquoterequestlocationid] || [];
        const { totalMRR, totalTCV } = calculateTotals({ [record.foxy_foxyquoterequestlocationid]: locationLineItems });
        const isExpanded = expandedRowKeys.includes(record.foxy_foxyquoterequestlocationid);
        
        return (
          <Row align="middle" justify="space-between" style={{ width: '100%' }}>
            <Col flex="auto">
              <Space direction="vertical" size="small">
                <Text strong>{text || record.foxy_locationid}</Text>
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
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(record.foxy_foxyquoterequestlocationid);
                }}
              />
            </Col>
          </Row>
        );
      },
    }
  ];

  return (
    <>
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
              onUpdateLineItem={(updatedItem) => onUpdateLineItem(record.foxy_foxyquoterequestlocationid, updatedItem)}
              onDeleteLineItem={(itemId) => onDeleteLineItem(record.foxy_foxyquoterequestlocationid, itemId)}
              triggerNewLine={record.foxy_foxyquoterequestlocationid === addingProductToLocation}
              onNewLineComplete={() => setAddingProductToLocation(null)}
            />
          ),
          rowExpandable: (record) => lineItems[record.foxy_foxyquoterequestlocationid]?.length > 0,
        }}
        showHeader={false}
        size="small"
      />
      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
      >
        <p>Are you sure you want to delete this location? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default LocationsTable;
