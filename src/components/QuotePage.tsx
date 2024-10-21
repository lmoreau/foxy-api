import React, { Dispatch, SetStateAction, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Spin, Alert, Row, Col, Card, Statistic, Button, Space } from 'antd';
import { DollarOutlined, UserOutlined, PlusOutlined, ExpandAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import QuoteHeader from './QuoteHeader';
import LocationsTable from './LocationsTable';
import AddLocationModal from './AddLocationModal';
import { useQuoteData } from '../hooks/useQuoteData';
import { useModal } from '../hooks/useModal';
import { handleAddLine, calculateTotals } from '../utils/quoteUtils';

const { Content } = Layout;

interface QuotePageProps {
  setQuoteRequestId: Dispatch<SetStateAction<string | undefined>>;
}

const QuoteSummary: React.FC<{ owner: string; totalMRR: number; totalTCV: number }> = ({ owner, totalMRR, totalTCV }) => (
  <Card>
    <Row gutter={16}>
      <Col span={8}>
        <Statistic
          title="Owner"
          value={owner}
          prefix={<UserOutlined />}
        />
      </Col>
      <Col span={8}>
        <Statistic
          title="Total MRR"
          value={totalMRR}
          precision={2}
          prefix={<DollarOutlined />}
          valueStyle={{ color: '#3f8600' }}
        />
      </Col>
      <Col span={8}>
        <Statistic
          title="Total TCV"
          value={totalTCV}
          precision={2}
          prefix={<DollarOutlined />}
          valueStyle={{ color: '#1890ff' }}
        />
      </Col>
    </Row>
  </Card>
);

const TableActions: React.FC<{ onAddLocation: () => void; onToggleExpand: () => void; expandAll: boolean }> = 
  ({ onAddLocation, onToggleExpand, expandAll }) => (
  <Space style={{ marginBottom: 16 }}>
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
  const { accountName, quoteId, locations, lineItems, error, loading } = useQuoteData(id);
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
      <Layout style={{ minHeight: '100vh', padding: '24px' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <QuoteHeader accountName={accountName} />
      <Content style={{ marginTop: '24px' }}>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <QuoteSummary owner="Bob Smith" totalMRR={totalMRR} totalTCV={totalTCV} />
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
