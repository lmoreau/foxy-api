import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Row, Col, Modal, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import QuoteLineItemsTable from './QuoteLineItemsTable';
import { QuoteLocation, QuoteLineItem } from '../types';
import { calculateTotals } from '../utils/quoteUtils';
import { formatCurrency } from '../utils/formatters';
import './LocationsTable.css';

const { Title } = Typography;

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
  onAddLine: _onAddLine,
  onUpdateLineItem,
  onDeleteLineItem,
  expandAll,
  onDeleteLocation,
}) => {
  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [addingProductToLocation, setAddingProductToLocation] = useState<string | null>(null);

  useEffect(() => {
    if (expandAll) {
      setExpandedLocations(data.map(location => location.foxy_foxyquoterequestlocationid));
    } else {
      setExpandedLocations([]);
    }
  }, [expandAll, data]);

  const handleDeleteClick = (locationId: string) => {
    setLocationToDelete(locationId);
    setDeleteModalVisible(true);
  };

  const handleAddProduct = (locationId: string) => {
    setAddingProductToLocation(locationId);
    if (!expandedLocations.includes(locationId)) {
      setExpandedLocations([...expandedLocations, locationId]);
    }
  };

  return (
    <div className="locations-container">
      {data.map(location => {
        const locationLineItems = lineItems[location.foxy_foxyquoterequestlocationid] || [];
        const { totalMRR, totalTCV } = calculateTotals({ 
          [location.foxy_foxyquoterequestlocationid]: locationLineItems 
        });
        const isExpanded = expandedLocations.includes(location.foxy_foxyquoterequestlocationid);

        return (
          <Card 
            key={location.foxy_foxyquoterequestlocationid}
            className="location-card"
            style={{ marginBottom: 16 }}
          >
            {/* Location Header */}
            <Row align="middle" justify="space-between" style={{ marginBottom: isExpanded ? 16 : 0 }}>
              <Col>
                <Title level={5} style={{ margin: 0 }}>
                  {location.foxy_Building?.foxy_fulladdress || location.foxy_locationid}
                </Title>
              </Col>
              <Col>
                <Space>
                  {!isExpanded && (
                    <Space size="large" style={{ marginRight: 16 }}>
                      <div style={{ width: 120, textAlign: 'right' }}>
                        <div style={{ color: '#00000073', fontSize: '14px', textAlign: 'right' }}>MRR</div>
                        <div style={{ fontSize: '14px', textAlign: 'right' }}>{formatCurrency(totalMRR)}</div>
                      </div>
                      <div style={{ width: 120, textAlign: 'right' }}>
                        <div style={{ color: '#00000073', fontSize: '14px', textAlign: 'right' }}>TCV</div>
                        <div style={{ fontSize: '14px', textAlign: 'right' }}>{formatCurrency(totalTCV)}</div>
                      </div>
                    </Space>
                  )}
                  <Space>
                    {isExpanded && (
                      <>
                        <Tooltip title="Add Product">
                          <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddProduct(location.foxy_foxyquoterequestlocationid)}
                            type="text"
                            style={{ color: '#1890ff' }}
                          />
                        </Tooltip>
                        <Tooltip title="Product Catalogue">
                          <Button
                            icon={<AppstoreAddOutlined />}
                            onClick={() => {/* Product Catalogue functionality */}}
                            type="text"
                            style={{ color: '#52c41a' }}
                          />
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Delete Location">
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteClick(location.foxy_foxyquoterequestlocationid)}
                        type="text"
                        style={{ color: '#ff4d4f' }}
                      />
                    </Tooltip>
                    <Button
                      type="link"
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedLocations(expandedLocations.filter(id => id !== location.foxy_foxyquoterequestlocationid));
                        } else {
                          setExpandedLocations([...expandedLocations, location.foxy_foxyquoterequestlocationid]);
                        }
                      }}
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </Space>
                </Space>
              </Col>
            </Row>

            {/* Line Items Table */}
            {isExpanded && (
              <div className="line-items-container">
                <QuoteLineItemsTable
                  initialLineItems={locationLineItems}
                  onUpdateLineItem={(updatedItem) => onUpdateLineItem(location.foxy_foxyquoterequestlocationid, updatedItem)}
                  onDeleteLineItem={(itemId) => onDeleteLineItem(location.foxy_foxyquoterequestlocationid, itemId)}
                  triggerNewLine={location.foxy_foxyquoterequestlocationid === addingProductToLocation}
                  onNewLineComplete={() => setAddingProductToLocation(null)}
                  locationId={location.foxy_foxyquoterequestlocationid}
                />
              </div>
            )}
          </Card>
        );
      })}

      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={() => {
          if (locationToDelete) onDeleteLocation(locationToDelete);
          setDeleteModalVisible(false);
        }}
        onCancel={() => setDeleteModalVisible(false)}
      >
        <p>Are you sure you want to delete this location? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default LocationsTable;
