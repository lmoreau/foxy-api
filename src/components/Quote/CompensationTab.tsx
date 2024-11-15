import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const CompensationTab: React.FC = () => (
  <div style={{ padding: '20px' }}>
    <Title level={3}>Compensation Details</Title>
    <Paragraph>This section is only visible to administrators.</Paragraph>
  </div>
);

export default CompensationTab;
