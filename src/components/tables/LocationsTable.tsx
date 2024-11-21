import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Row, Col, Modal, Tooltip, message, Tag } from 'antd';
import { DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import QuoteLineItemsTable from './QuoteLineItemsTable';
import { QuoteLocation, QuoteLineItem } from '../../types';
import { calculateTotals } from '../../utils/quoteUtils';
import { formatCurrency } from '../../utils/formatters';
import { foxy_rogersfibre, foxy_rogerscable, foxy_gpon, getFoxyRogersFibreLabel, getFoxyRogersCableLabel, getFoxyGponLabel } from '../../utils/networkTypeMapper';
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
  quoteStage?: number;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  data,
  lineItems,
  onAddLine: _onAddLine,
  onUpdateLineItem,
  onDeleteLineItem,
  expandAll,
  onDeleteLocation,
  quoteStage,
}) => {
  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [addingProductToLocation, setAddingProductToLocation] = useState<string | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<string | null>(null);

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

  const handleDeleteConfirm = async () => {
    if (locationToDelete) {
      setDeletingLocation(locationToDelete);
      message.loading({ content: 'Deleting location and associated items...', key: 'deleteLocation', duration: 0 });
      
      try {
        await onDeleteLocation(locationToDelete);
        message.success({ content: 'Location deleted successfully', key: 'deleteLocation' });
      } catch (error) {
        message.error({ content: 'Failed to delete location', key: 'deleteLocation' });
        console.error('Delete location error:', error);
      } finally {
        setDeletingLocation(null);
        setDeleteModalVisible(false);
      }
    }
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
        const isDeleting = deletingLocation === location.foxy_foxyquoterequestlocationid;

        return (
          <Card 
            key={location.foxy_foxyquoterequestlocationid}
            className="location-card"
            style={{ marginBottom: 16 }}
          >
            {/* Location Header */}
            <Row align="middle" justify="space-between" style={{ marginBottom: isExpanded ? 16 : 0 }}>
              <Col>
                <Space size={24}>
                  <Title level={5} style={{ margin: 0 }}>
                    {location.foxy_Building?.foxy_fulladdress || location.foxy_locationid}
                  </Title>
                  <Space size={4}>
                    {typeof location.foxy_Building?.foxy_rogersfibre === 'number' && (
                      <Tag 
                        color={location.foxy_Building.foxy_rogersfibre === 612100004 ? 'red' : 
                              location.foxy_Building.foxy_rogersfibre === 612100000 ? 'green' : 'blue'} 
                        style={{ margin: 0 }}
                      >
                        <b>Fibre:</b> {getFoxyRogersFibreLabel(location.foxy_Building.foxy_rogersfibre)}
                      </Tag>
                    )}
                    {typeof location.foxy_Building?.foxy_rogerscable === 'number' && (
                      <Tag 
                        color={location.foxy_Building.foxy_rogerscable === 612100002 || location.foxy_Building.foxy_rogerscable === 612100003 ? 'red' : 
                              location.foxy_Building.foxy_rogerscable === 612100000 ? 'green' : 'cyan'} 
                        style={{ margin: 0 }}
                      >
                        <b>Cable:</b> {getFoxyRogersCableLabel(location.foxy_Building.foxy_rogerscable)}
                      </Tag>
                    )}
                    {typeof location.foxy_Building?.foxy_gpon === 'number' && (
                      <Tag 
                        color={location.foxy_Building.foxy_gpon === 612100003 ? 'red' : 
                              location.foxy_Building.foxy_gpon === 612100000 ? 'green' : 'cyan'} 
                        style={{ margin: 0 }}
                      >
                        <b>GPON:</b> {getFoxyGponLabel(location.foxy_Building.foxy_gpon)}
                      </Tag>
                    )}
                  </Space>
                </Space>
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
                            disabled={isDeleting}
                          />
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title={isDeleting ? "Deleting..." : "Delete Location"}>
                      <Button
                        icon={isDeleting ? <LoadingOutlined /> : <DeleteOutlined />}
                        onClick={() => handleDeleteClick(location.foxy_foxyquoterequestlocationid)}
                        type="text"
                        style={{ color: '#ff4d4f' }}
                        disabled={isDeleting}
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
                      disabled={isDeleting}
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
                  quoteStage={quoteStage}
                />
              </div>
            )}
          </Card>
        );
      })}

      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={!!deletingLocation}
        okButtonProps={{ disabled: !!deletingLocation }}
        cancelButtonProps={{ disabled: !!deletingLocation }}
      >
        <p>Are you sure you want to delete this location and all its line items? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default LocationsTable;
