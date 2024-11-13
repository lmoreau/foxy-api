import React, { Dispatch, SetStateAction, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Alert, Row, Col, Card, Statistic, Button, Space, Typography, message, Tabs, Modal } from 'antd';
import { UserOutlined, PlusOutlined, ExpandAltOutlined, ShrinkOutlined, CopyOutlined, EditOutlined } from '@ant-design/icons';
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
  quoteId: string;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ 
  owner, 
  totalMRR, 
  totalTCV, 
  quoteStage, 
  quoteType,
  quoteId 
}) => {
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
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote"
            value={quoteId}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote Type"
            value={getQuoteTypeLabel(quoteType)}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote Stage"
            value={getQuoteStageLabel(quoteStage)}
            valueStyle={{ fontSize: '14px' }}
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

const TableActions: React.FC<{ onAddLocation: () => void; onToggleExpand: () => void; expandAll: boolean; onCloneQuote: () => void }> = 
  ({ onAddLocation, onToggleExpand, expandAll, onCloneQuote }) => (
  <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Button icon={<CopyOutlined />} onClick={onCloneQuote}>
      Clone Quote
    </Button>
    <Button icon={<PlusOutlined />} onClick={onAddLocation}>
      Add Location
    </Button>
    <Button icon={expandAll ? <ShrinkOutlined /> : <ExpandAltOutlined />} onClick={onToggleExpand}>
      {expandAll ? 'Collapse All' : 'Expand All'}
    </Button>
  </Space>
);

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
  const { totalMRR, totalTCV } = calculateTotals(lineItems);
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

  const handleUpdateLineItem = (locationId: string, updatedItem: QuoteLineItem) => {
    const updatedLineItems = lineItems[locationId].map(item => 
      item.foxy_foxyquoterequestlineitemid === updatedItem.foxy_foxyquoterequestlineitemid 
        ? updatedItem 
        : item
    );
    
    setLineItems(prev => ({
      ...prev,
      [locationId]: updatedLineItems
    }));
    
    message.success('Line item updated successfully');
    refetchLocations();
  };

  const handleDeleteLineItem = async (_locationId: string, _itemId: string) => {
    message.success('Line item deleted successfully');
  };

  const handleAddLineItem = async (_locationId: string, _newItem: any) => {
    refetchLocations();
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
              label: 'Quote',
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
                    <TableActions 
                      onAddLocation={show}
                      onToggleExpand={toggleExpandAll}
                      expandAll={expandAll}
                      onCloneQuote={handleCloneQuote}
                    />
                  </Col>
                  <Col span={24}>
                    <QuoteSummary 
                      owner={owninguser?.fullname || ''} 
                      totalMRR={totalMRR} 
                      totalTCV={totalTCV}
                      quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
                      quoteType={rawQuoteData.quoteRequest?.foxy_quotetype}
                      quoteId={rawQuoteData.quoteRequest?.foxy_quoteid || ''}
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
        visible={subjectModalVisible}
        onCancel={() => setSubjectModalVisible(false)}
        onConfirm={handleSubjectUpdate}
        initialValue={rawQuoteData.quoteRequest?.foxy_subject || ''}
      />
    </Layout>
  );
};

export default QuotePage;
