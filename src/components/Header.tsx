import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ quoteRequestId }) => {
  const location = useLocation();

  const getHeaderTitle = () => {
    if (location.pathname === '/products') {
      return 'Product Management';
    } else if (quoteRequestId) {
      return `Quote Request: ${quoteRequestId}`;
    }
    return null;
  };

  const menuItems = [
    { key: 'header', label: getHeaderTitle() },
    { key: 'quotes', label: <Link to="/quotes">Quotes</Link> },
    { key: 'products', label: <Link to="/products">Products</Link> },
    { key: 'customers', label: <Link to="/customers">Customers</Link> },
  ].filter(item => item.label !== null);

  const getSelectedKey = () => {
    if (location.pathname === '/products') {
      return 'header';
    } else if (location.pathname.startsWith('/quote/') || quoteRequestId) {
      return 'header';
    }
    return location.pathname.slice(1) || 'header'; // Remove leading slash
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '48px', lineHeight: '48px' }}>
      <div className="logo" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: '24px' }}>
        RITA
      </div>
      <Menu 
        theme="dark" 
        mode="horizontal" 
        selectedKeys={[getSelectedKey()]}
        style={{ flex: 1, minWidth: 0, height: '48px', lineHeight: '48px' }} 
        items={menuItems} 
      />
      <div style={{ marginLeft: 'auto' }}>
        <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
      </div>
    </Header>
  );
};

export default AppHeader;
