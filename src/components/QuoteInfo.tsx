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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Text strong>Owner:</Text> {owner}
      </Col>
      <Col span={6}>
        <Text strong>Quote Request:</Text> {quoteId}
      </Col>
      <Col span={6}>
        <Text strong>Quote Total MRR:</Text> {formatCurrency(totalMRR)}
      </Col>
      <Col span={6}>
        <Text strong>Quote Total TCV:</Text> {formatCurrency(totalTCV)}
      </Col>
    </Row>
  );
};

export default QuoteInfo;
