import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ quoteRequestId }) => {
  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '48px', lineHeight: '48px' }}>
      <div className="logo" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: '24px' }}>
        RITA
      </div>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ flex: 1, minWidth: 0, height: '48px', lineHeight: '48px' }}>
        {quoteRequestId && <Menu.Item key="1">Quote Request: {quoteRequestId}</Menu.Item>}
        <Menu.Item key="2">Quotes</Menu.Item>
        <Menu.Item key="3">Products</Menu.Item>
        <Menu.Item key="4">Customers</Menu.Item>
      </Menu>
      <div style={{ marginLeft: 'auto' }}>
        <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
      </div>
    </Header>
  );
};

export default AppHeader;
