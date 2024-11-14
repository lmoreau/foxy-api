import React, { Dispatch, SetStateAction, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Alert, Row, Col, Card, Statistic, Button, Space, Typography, message, Tabs, Modal, Tooltip, Input } from 'antd';
import { UserOutlined, PlusOutlined, ExpandAltOutlined, ShrinkOutlined, CopyOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import LocationsTable from './LocationsTable';
import AddLocationModal from './AddLocationModal';
import { useQuoteData } from '../hooks/useQuoteData';
import { useModal } from '../hooks/useModal';
import { calculateTotals, deleteQuoteLocation } from '../utils/quoteUtils';
import { QuoteLineItem, QuoteLocation } from '../types';
import { createQuoteRequest, createFoxyQuoteRequestLocation, updateQuoteRequest } from '../utils/api';
import SubjectEditModal from './SubjectEditModal';
import { getQuoteStageLabel } from '../utils/quoteStageMapper';
import { getQuoteTypeLabel } from '../utils/quoteTypeMapper';

const { Content } = Layout;
const { Text } = Typography;

interface QuotePageProps {
  setQuoteRequestId: Dispatch<SetStateAction<string | undefined>>;
}

interface QuoteSummaryProps {
  owner: string;
  totalMRR: number;
  totalTCV: number;
  quoteStage: number;
  quoteType: number;
  opticQuote: string;
  onOpticQuoteEdit: (value: string) => Promise<void>;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ 
  owner, 
  totalMRR, 
  totalTCV, 
  quoteStage, 
  quoteType,
  opticQuote,
  onOpticQuoteEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(opticQuote);

  const handleSave = async () => {
    try {
      await onOpticQuoteEdit(editValue);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card size="small">
      <Row gutter={[8, 8]} align="middle">
        <Col span={3}>
          <Statistic
            title="Owner"
            value={owner}
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={4}>
          <div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>OptiC Quote</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {isEditing ? (
                <Space>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onPressEnter={handleSave}
                    onBlur={handleSave}
                    autoFocus
                  />
                </Space>
              ) : (
                <Space>
                  {opticQuote || '-'}
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    style={{ marginLeft: 8 }}
                  />
                </Space>
              )}
            </div>
          </div>
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote Type"
            value={getQuoteTypeLabel(quoteType)}
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote Stage"
            value={getQuoteStageLabel(quoteStage)}
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Total MRR"
            value={formatCurrency(totalMRR)}
            valueStyle={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={5}>
          <Statistic
            title="Total TCV"
            value={formatCurrency(totalTCV)}
            valueStyle={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

const validateQuoteReadyForSubmit = (locations: QuoteLocation[], lineItems: { [key: string]: QuoteLineItem[] }): boolean => {
  // Check if there's at least one location
  if (!locations || locations.length === 0) return false;

  // Check each location
  for (const location of locations) {
    const locationId = location.foxy_foxyquoterequestlocationid;
    const locationLineItems = lineItems[locationId];

    // Check if location has at least one line item
    if (!locationLineItems || locationLineItems.length === 0) return false;

    // Check each line item in this location
    for (const item of locationLineItems) {
      // Basic required fields for all items
      if (!item.foxy_Product?.name || 
          item.foxy_revenuetype === undefined || 
          !item.foxy_term || 
          !item.foxy_quantity || 
          item.foxy_each === undefined) {
        return false;
      }

      // Additional fields required for Upsell (612100002) and Renewal (612100003)
      if (item.foxy_revenuetype === 612100002 || item.foxy_revenuetype === 612100003) {
        if (!item.foxy_renewaltype || 
            !item.foxy_renewaldate || 
            item.foxy_existingqty === undefined || 
            item.foxy_existingmrr === undefined) {
          return false;
        }
      }
    }
  }

  return true;
};

const PageActions: React.FC<{ 
  onAddLocation: () => void; 
  onToggleExpand: () => void; 
  expandAll: boolean; 
  onCloneQuote: () => void;
  quoteStage: number;
  quoteId?: string;
  onRefresh: () => Promise<void>;
  locations: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
}> = ({ 
  onAddLocation, 
  onToggleExpand, 
  expandAll, 
  onCloneQuote, 
  quoteStage, 
  quoteId, 
  onRefresh,
  locations,
  lineItems 
}) => {
  const showQuoteActionButton = [612100000, 612100001, 612100002].includes(quoteStage);
  const isSubmitStage = quoteStage === 612100000 || quoteStage === 612100002;
  const isQuoteValid = !isSubmitStage || validateQuoteReadyForSubmit(locations, lineItems);
  
  const handleQuoteAction = () => {
    const isSubmit = quoteStage === 612100000;
    const isResubmit = quoteStage === 612100002;
    const isRecall = quoteStage === 612100001;
    
    Modal.confirm({
      title: isSubmit ? 'Submit Quote' : isResubmit ? 'Resubmit Quote' : 'Recall Quote',
      content: isSubmit ? 
        'Are you sure you want to submit this quote?' : 
        isResubmit ?
        'Are you sure you want to resubmit this quote?' :
        'Are you sure you want to recall this quote?',
      onOk: async () => {
        try {
          if (!quoteId) {
            message.error('Quote ID is missing');
            return;
          }

          await updateQuoteRequest(quoteId, {
            foxy_quotestage: isRecall ? 612100000 : 612100001
          });

          message.success(`Quote ${isSubmit ? 'submitted' : isResubmit ? 'resubmitted' : 'recalled'} successfully`);
          await onRefresh();
        } catch (error) {
          console.error('Error updating quote stage:', error);
          message.error(`Failed to ${isSubmit ? 'submit' : isResubmit ? 'resubmit' : 'recall'} quote`);
        }
      }
    });
  };

  return (
    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      {showQuoteActionButton && (
        <Tooltip title={
          !isQuoteValid && isSubmitStage ? 
          "Quote cannot be submitted. Please ensure: \n• At least one location is added\n• Each location has at least one product\n• All required fields are filled in for each product" 
          : ""
        }>
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleQuoteAction}
            disabled={!isQuoteValid}
          >
            {quoteStage === 612100000 ? 'Submit Quote' : 
             quoteStage === 612100002 ? 'Resubmit Quote' : 
             'Recall Quote'}
          </Button>
        </Tooltip>
      )}
      <Button icon={<CopyOutlined />} onClick={onCloneQuote}>
        Clone Quote
      </Button>
      <Button icon={<PlusOutlined />} onClick={onAddLocation}>
        Add Location
      </Button>
      <Button 
        icon={expandAll ? <ShrinkOutlined /> : <ExpandAltOutlined />} 
        onClick={onToggleExpand}
        style={{ padding: '4px 8px' }}
      >
      </Button>
    </Space>
  );
};

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
    setLineItems,
    refetch 
  } = useQuoteData(id);
  const { isVisible, show, hide } = useModal();
  const [expandAll, setExpandAll] = useState(true);
  const [rawData, setRawData] = useState<{
    lineItems: { [key: string]: QuoteLineItem[] };
    locations: QuoteLocation[];
    quoteRequest: any;
  }>({
    lineItems: {},
    locations: [],
    quoteRequest: {}
  });
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  React.useEffect(() => {
    setQuoteRequestId(quoteId);
  }, [quoteId, setQuoteRequestId]);

  React.useEffect(() => {
    if (rawQuoteData) {
      setRawData(rawQuoteData);
    }
  }, [rawQuoteData]);

  const handleCloneQuote = () => {
    Modal.confirm({
      title: 'Clone Quote',
      content: 'Are you sure you want to clone this quote?',
      onOk: async () => {
        try {
          const newQuote = await createQuoteRequest({
            _foxy_account_value: accountId,
            _foxy_opportunity_value: rawQuoteData.quoteRequest._foxy_opportunity_value
          });

          if (newQuote.foxy_foxyquoterequestid) {
            const locationPromises = rawQuoteData.locations.map(location => 
              createFoxyQuoteRequestLocation(
                location._foxy_building_value,
                newQuote.foxy_foxyquoterequestid,
                location._foxy_companylocation_value
              )
            );

            await Promise.all(locationPromises);
            message.success('Quote and locations cloned successfully');
            navigate(`/quote/${newQuote.foxy_foxyquoterequestid}`);
          }
        } catch (error) {
          message.error('Failed to clone quote');
          console.error('Clone error:', error);
        }
      }
    });
  };

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
  };

  const handleAddLocationSuccess = () => {
    hide();
    refetchLocations();
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteQuoteLocation(locationId);
      message.success('Location deleted successfully');
      refetchLocations();
    } catch (error) {
      message.error('Failed to delete location');
    }
  };

  const handleUpdateLineItem = async (locationId: string, updatedItem: QuoteLineItem) => {
    try {
      await refetchLocations();
      const isNewItem = updatedItem.foxy_foxyquoterequestlineitemid.startsWith('temp-');
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

  const handleSubjectUpdate = async (newSubject: string) => {
    try {
      await updateQuoteRequest(id!, { foxy_subject: newSubject });
      await refetch();
      message.success('Subject updated successfully');
    } catch (error) {
      message.error('Failed to update subject');
      console.error('Update subject error:', error);
    } finally {
      setSubjectModalVisible(false);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '12px' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', padding: '12px' }}>
      <Content>
        <Tabs
          items={[
            {
              key: '1',
              label: rawQuoteData.quoteRequest?.foxy_quoteid || 'New Quote',
              children: (
                <Row gutter={[0, 16]}>
                  <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '16px', display: 'block' }}>{accountName}</Text>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {rawQuoteData.quoteRequest?.foxy_subject}
                        </Text>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => setSubjectModalVisible(true)}
                        />
                      </Space>
                    </div>
                    <PageActions 
                      onAddLocation={show}
                      onToggleExpand={toggleExpandAll}
                      expandAll={expandAll}
                      onCloneQuote={handleCloneQuote}
                      quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
                      quoteId={id}
                      onRefresh={refetch}
                      locations={locations}
                      lineItems={lineItems}
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
              label: 'Line Items',
              children: (
                <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                  {JSON.stringify(rawData.lineItems, null, 2)}
                </pre>
              ),
            },
            {
              key: '3',
              label: 'Locations',
              children: (
                <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                  {JSON.stringify(rawData.locations, null, 2)}
                </pre>
              ),
            },
            {
              key: '4',
              label: 'Quote Request',
              children: (
                <pre style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                  {JSON.stringify(rawData.quoteRequest, null, 2)}
                </pre>
              ),
            },
          ]}
        />
      </Content>
      <AddLocationModal
        isVisible={isVisible}
        onOk={handleAddLocationSuccess}
        onCancel={hide}
        quoteRequestId={id || ''}
        accountId={accountId}
        onRefresh={refetchLocations}
      />
      <SubjectEditModal
        open={subjectModalVisible}
        onCancel={() => setSubjectModalVisible(false)}
        onConfirm={handleSubjectUpdate}
        initialValue={rawQuoteData.quoteRequest?.foxy_subject || ''}
      />
    </Layout>
  );
};

export default QuotePage;
