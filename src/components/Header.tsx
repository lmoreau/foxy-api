import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ quoteRequestId }) => {
  const menuItems = [
    ...(quoteRequestId ? [{ key: '1', label: `Quote Request: ${quoteRequestId}` }] : []),
    { key: '2', label: <Link to="/quotes">Quotes</Link> },
    { key: '3', label: <Link to="/products">Products</Link> },
    { key: '4', label: <Link to="/customers">Customers</Link> },
  ];

  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '48px', lineHeight: '48px' }}>
      <div className="logo" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: '24px' }}>
        RITA
      </div>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ flex: 1, minWidth: 0, height: '48px', lineHeight: '48px' }} items={menuItems} />
      <div style={{ marginLeft: 'auto' }}>
        <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
      </div>
    </Header>
  );
};

export default AppHeader;
