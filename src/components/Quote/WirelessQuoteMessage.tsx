import React from 'react';
import { Result } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const WirelessQuoteMessage: React.FC = () => {
  return (
    <Result
      icon={<RocketOutlined />}
      title="Wireless Quotes are Coming Soon"
      subTitle="We're working hard to bring you wireless quoting capabilities. Stay tuned!"
      style={{ background: '#fff', borderRadius: '8px', padding: '48px 32px' }}
    />
  );
};

export default WirelessQuoteMessage;
