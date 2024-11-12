import React, { Dispatch, SetStateAction, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Spin, Alert, Row, Col, Card, Statistic, Button, Space, Typography, message, Tabs } from 'antd';
import { UserOutlined, PlusOutlined, ExpandAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import LocationsTable from './LocationsTable';
import AddLocationModal from './AddLocationModal';
import { useQuoteData } from '../hooks/useQuoteData';
import { useModal } from '../hooks/useModal';
import { calculateTotals, deleteQuoteLocation } from '../utils/quoteUtils';
import { QuoteLineItem, QuoteLocation } from '../types';

const { Content } = Layout;
const { Text } = Typography;

interface QuotePageProps {
  setQuoteRequestId: Dispatch<SetStateAction<string | undefined>>;
}

const QuoteSummary: React.FC<{ owner: string; totalMRR: number; totalTCV: number }> = ({ owner, totalMRR, totalTCV }) => {
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
        <Col span={4}>
          <Statistic
            title="Owner"
            value={owner}
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote Type"
            value="Wireline"
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Quote Stage"
            value="Draft"
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Total MRR"
            value={formatCurrency(totalMRR)}
            valueStyle={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={6}>
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

const TableActions: React.FC<{ onAddLocation: () => void; onToggleExpand: () => void; expandAll: boolean }> = 
  ({ onAddLocation, onToggleExpand, expandAll }) => (
  <Space style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
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
    setLineItems 
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

  React.useEffect(() => {
    setQuoteRequestId(quoteId);
  }, [quoteId, setQuoteRequestId]);

  React.useEffect(() => {
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
                <Row gutter={[0, 4]}>
                  <Col span={24}>
                    <Text strong style={{ fontSize: '16px' }}>{accountName}</Text>
                  </Col>
                  <Col span={24}>
                    <QuoteSummary owner={owninguser?.fullname || ''} totalMRR={totalMRR} totalTCV={totalTCV} />
                  </Col>
                  <Col span={24}>
                    <TableActions onAddLocation={show} onToggleExpand={toggleExpandAll} expandAll={expandAll} />
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
    </Layout>
  );
};

export default QuotePage;
