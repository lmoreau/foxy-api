import React from 'react';
import { Typography, Button, Space } from 'antd';

const { Title } = Typography;

interface QuoteHeaderProps {
  accountName: string;
  onAddLocation: () => void;
  onToggleExpand: () => void;
  expandAll: boolean;
}

const QuoteHeader: React.FC<QuoteHeaderProps> = ({ accountName, onAddLocation, onToggleExpand, expandAll }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <Title level={2}>{accountName}</Title>
      <Space>
        <Button type="primary" onClick={onAddLocation}>
          Add Location
        </Button>
        <Button onClick={onToggleExpand}>
          {expandAll ? 'Collapse All' : 'Expand All'}
        </Button>
      </Space>
    </div>
  );
};

export default QuoteHeader;
