import React from 'react';
import { Layout } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import CommandPalette from './CommandPalette';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const location = useLocation();

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 16px', 
      height: '48px', 
      lineHeight: '48px',
      justifyContent: 'space-between'
    }}>
      {/* Logo and text section */}
      <Link to="/residual-check" style={{ textDecoration: 'none' }}>
        <div className="logo" style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          display: 'flex', 
          alignItems: 'center',
          minWidth: '200px'
        }}>
          <img src="/foxylogo.png" alt="Foxy Logo" style={{ height: '30px', marginRight: '8px' }} />
          Foxy Ledger
        </div>
      </Link>

      {/* Command palette section - centered */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <CommandPalette />
      </div>

      {/* Avatar section */}
      <div style={{ 
        minWidth: '200px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
      </div>
    </Header>
  );
};

export default AppHeader;
