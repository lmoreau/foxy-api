import React, { Dispatch, SetStateAction, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Spin, Alert, Row, Col, Card, Statistic, Button, Space, Typography } from 'antd';
import { DollarOutlined, UserOutlined, PlusOutlined, ExpandAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import LocationsTable from './LocationsTable';
import AddLocationModal from './AddLocationModal';
import { useQuoteData } from '../hooks/useQuoteData';
import { useModal } from '../hooks/useModal';
import { handleAddLine, calculateTotals } from '../utils/quoteUtils';

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
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#3f8600', fontSize: '14px' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Total TCV"
            value={formatCurrency(totalTCV)}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#1890ff', fontSize: '14px' }}
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
  const { accountName, quoteId, locations, lineItems, error, loading, owninguser } = useQuoteData(id);
  const { isVisible, show, hide } = useModal();
  const { totalMRR, totalTCV } = calculateTotals(lineItems);
  const [expandAll, setExpandAll] = useState(true);

  React.useEffect(() => {
    setQuoteRequestId(quoteId);
  }, [quoteId, setQuoteRequestId]);

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
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
              onAddLine={handleAddLine}
              expandAll={expandAll}
            />
          </Col>
        </Row>
      </Content>
      <AddLocationModal
        isVisible={isVisible}
        onOk={hide}
        onCancel={hide}
        quoteRequestId={id || ''}
      />
    </Layout>
  );
};

export default QuotePage;