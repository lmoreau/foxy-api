import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

interface QuoteHeaderProps {
  accountName: string;
}

const QuoteHeader: React.FC<QuoteHeaderProps> = ({ accountName }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <Title level={2}>{accountName}</Title>
    </div>
  );
};

export default QuoteHeader;
