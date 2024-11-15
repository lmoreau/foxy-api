import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Alert, Row, Col, Tabs, Typography, Input, Space, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import LocationsTable from '../LocationsTable';
import AddLocationModal from '../AddLocationModal';
import { useQuoteData } from '../../hooks/useQuoteData';
import { useModal } from '../../hooks/useModal';
import { calculateTotals, deleteQuoteLocation } from '../../utils/quoteUtils';
import { deleteQuoteLineItem, updateQuoteRequest } from '../../utils/api';
import { checkUserAccess } from '../../auth/authService';
import QuoteCPQHeader from '../QuoteCPQHeader';
import QuoteSummary from './QuoteSummary';
import QuoteActions from './QuoteActions';
import { QuotePageProps, RawQuoteData } from './types';

const { Content } = Layout;
const { Text } = Typography;

const QuotePage: React.FC<QuotePageProps> = ({ setQuoteRequestId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    accountName, 
    quoteId, 
    locations, 
    lineItems, 
    error, 
    loading, 
    owninguser, 
    accountId, 
    refetchLocations,
    rawQuoteData,
    refetch 
  } = useQuoteData(id);
  const { isVisible, show, hide } = useModal();
  const [expandAll, setExpandAll] = useState(true);
  const [rawData, setRawData] = useState<RawQuoteData>({
    lineItems: {},
    locations: [],
    quoteRequest: {}
  });
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editSubjectValue, setEditSubjectValue] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const access = await checkUserAccess();
      setIsAdmin(access === 'admin');
    };
    checkAdminAccess();
  }, []);

  useEffect(() => {
    setQuoteRequestId(quoteId);
  }, [quoteId, setQuoteRequestId]);

  useEffect(() => {
    if (rawQuoteData) {
      setRawData(rawQuoteData);
    }
  }, [rawQuoteData]);

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
  };

  const handleAddLocationSuccess = () => {
    hide();
    refetchLocations();
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      // Get all line items for this location
      const locationLineItems = lineItems[locationId] || [];
      
      // Delete all line items first
      for (const item of locationLineItems) {
        await deleteQuoteLineItem(item.foxy_foxyquoterequestlineitemid);
      }
      
      // Then delete the location
      await deleteQuoteLocation(locationId);
      message.success('Location deleted successfully');
      refetchLocations();
    } catch (error) {
      message.error('Failed to delete location');
      console.error('Delete location error:', error);
    }
  };

  const handleUpdateLineItem = async (locationId: string, updatedItem: any) => {
    try {
      await refetchLocations();
      const isNewItem = updatedItem?.foxy_foxyquoterequestlineitemid?.startsWith('temp-') || false;
      message.success(`Line item ${isNewItem ? 'created' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error updating line item:', error);
      message.error('Failed to update line item');
    }
  };

  const handleDeleteLineItem = async (_locationId: string, _itemId: string) => {
    await refetchLocations();
  };

  const handleAddLineItem = async (_locationId: string, _newItem: any) => {
    await refetchLocations();
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '12px' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: rawQuoteData.quoteRequest?.foxy_quoteid || 'New Quote',
      children: (
        <Row gutter={[0, 16]}>
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ fontSize: '16px', display: 'block' }}>{accountName}</Text>
              <Space>
                {isEditingSubject ? (
                  <Input
                    value={editSubjectValue}
                    onChange={(e) => setEditSubjectValue(e.target.value)}
                    onPressEnter={async () => {
                      if (editSubjectValue !== rawQuoteData.quoteRequest?.foxy_subject) {
                        try {
                          await updateQuoteRequest(id!, { foxy_subject: editSubjectValue });
                          await refetch();
                          message.success('Subject updated successfully');
                        } catch (error) {
                          message.error('Failed to update subject');
                          console.error('Update subject error:', error);
                        }
                      }
                      setIsEditingSubject(false);
                    }}
                    onBlur={async () => {
                      if (editSubjectValue !== rawQuoteData.quoteRequest?.foxy_subject) {
                        try {
                          await updateQuoteRequest(id!, { foxy_subject: editSubjectValue });
                          await refetch();
                          message.success('Subject updated successfully');
                        } catch (error) {
                          message.error('Failed to update subject');
                          console.error('Update subject error:', error);
                        }
                      }
                      setIsEditingSubject(false);
                    }}
                    autoFocus
                    style={{ minWidth: '500px' }}
                  />
                ) : (
                  <div 
                    onClick={() => {
                      setEditSubjectValue(rawQuoteData.quoteRequest?.foxy_subject || '');
                      setIsEditingSubject(true);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      maxWidth: '500px'
                    }}
                  >
                    <Text 
                      type="secondary" 
                      style={{ 
                        fontSize: '14px',
                        display: 'inline-block'
                      }}
                    >
                      {rawQuoteData.quoteRequest?.foxy_subject || '-'}
                    </Text>
                    <EditOutlined style={{ color: '#00000073', flexShrink: 0 }} />
                  </div>
                )}
              </Space>
            </div>
            <QuoteActions 
              onAddLocation={show}
              onToggleExpand={toggleExpandAll}
              expandAll={expandAll}
              onCloneQuote={() => {}}
              quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
              quoteId={id}
              onRefresh={refetch}
              locations={locations}
              lineItems={lineItems}
              accountId={accountId}
              opportunityId={rawQuoteData.quoteRequest?._foxy_opportunity_value}
            />
          </Col>
          <Col span={24}>
            <QuoteSummary 
              owner={owninguser?.fullname || ''} 
              totalMRR={calculateTotals(lineItems).totalMRR} 
              totalTCV={calculateTotals(lineItems).totalTCV}
              quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
              quoteType={rawQuoteData.quoteRequest?.foxy_quotetype}
              opticQuote={rawQuoteData.quoteRequest?.foxy_opticquote || ''}
              onOpticQuoteEdit={async (value) => {
                try {
                  await updateQuoteRequest(id!, { foxy_opticquote: value });
                  await refetch();
                  message.success('OptiC Quote updated successfully');
                } catch (error) {
                  message.error('Failed to update OptiC Quote');
                  console.error('Update OptiC Quote error:', error);
                }
              }}
            />
          </Col>
          {error && (
            <Col span={24}>
              <Alert message="Error" description={error} type="error" showIcon />
            </Col>
          )}
          <Col span={24}>
            <LocationsTable
              data={locations}
              lineItems={lineItems}
              onAddLine={handleAddLineItem}
              expandAll={expandAll}
              onDeleteLocation={handleDeleteLocation}
              onUpdateLineItem={handleUpdateLineItem}
              onDeleteLineItem={handleDeleteLineItem}
              quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
            />
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Compensation',
      children: (
        <div style={{ padding: '20px' }}>
          <h3>Compensation Details</h3>
          <p>This section is only visible to administrators.</p>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Line Items',
      children: (
        <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {JSON.stringify(rawData.lineItems, null, 2)}
        </pre>
      ),
    },
    {
      key: '4',
      label: 'Locations',
      children: (
        <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {JSON.stringify(rawData.locations, null, 2)}
        </pre>
      ),
    },
    {
      key: '5',
      label: 'Quote Request',
      children: (
        <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {JSON.stringify(rawData.quoteRequest, null, 2)}
        </pre>
      ),
    },
  ];

  // Filter out the Compensation tab if user is not an admin
  const visibleTabs = isAdmin ? tabItems : tabItems.filter(tab => tab.key !== '2');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <QuoteCPQHeader />
      <Content style={{ padding: '20px 50px' }}>
        <Tabs items={visibleTabs} />
      </Content>
      <AddLocationModal
        isVisible={isVisible}
        onOk={handleAddLocationSuccess}
        onCancel={hide}
        quoteRequestId={id || ''}
        accountId={accountId}
        onRefresh={refetchLocations}
      />
    </Layout>
  );
};

export default QuotePage;
