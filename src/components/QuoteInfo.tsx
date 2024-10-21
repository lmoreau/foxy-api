import React from 'react';
import { Row, Col, Typography } from 'antd';

const { Text } = Typography;

interface QuoteInfoProps {
  owner: string;
  quoteId: string;
  totalMRR: number;
  totalTCV: number;
}

const QuoteInfo: React.FC<QuoteInfoProps> = ({ owner, quoteId, totalMRR, totalTCV }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Row gutter={[8, 8]} align="middle">
      <Col span={5}>
        <Text type="secondary" style={{ fontSize: '0.9em' }}>Owner:</Text>
      </Col>
      <Col span={7}>
        <Text>{owner}</Text>
      </Col>
      <Col span={5}>
        <Text type="secondary" style={{ fontSize: '0.9em' }}>Quote Request:</Text>
      </Col>
      <Col span={7}>
        <Text>{quoteId}</Text>
      </Col>
      <Col span={5}>
        <Text type="secondary" style={{ fontSize: '0.9em' }}>Total MRR:</Text>
      </Col>
      <Col span={7}>
        <Text>{formatCurrency(totalMRR)}</Text>
      </Col>
      <Col span={5}>
        <Text type="secondary" style={{ fontSize: '0.9em' }}>Total TCV:</Text>
      </Col>
      <Col span={7}>
        <Text>{formatCurrency(totalTCV)}</Text>
      </Col>
    </Row>
  );
};

export default QuoteInfo;
