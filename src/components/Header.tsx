import React, { useEffect, useState } from 'react';
import { Layout, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  AppstoreOutlined, 
  UnorderedListOutlined, 
  UploadOutlined, 
  CloudUploadOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import CommandPalette from './CommandPalette';
import { checkUserAccess, UserAccessLevel } from '../auth/authService';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const [userAccess, setUserAccess] = useState<UserAccessLevel>('none');

  useEffect(() => {
    const fetchUserAccess = async () => {
      const access = await checkUserAccess();
      setUserAccess(access);
    };
    fetchUserAccess();
  }, []);

  const getMenuItems = (): Required<MenuProps>['items'] => {
    const baseItems: Required<MenuProps>['items'] = [
      {
        key: 'residual-check',
        label: <Link to="/residual-check">Residual Account List</Link>,
        icon: <UnorderedListOutlined />,
      },
      {
        key: 'master-residual',
        label: <Link to="/master-residual-list">Search by Rogers Account</Link>,
        icon: <SearchOutlined />,
      },
      {
        key: 'won-services',
        label: <Link to="/won-services">Won Services</Link>,
        icon: <UnorderedListOutlined />,
      }
    ];

    // Only show Incoming Wireline Payments for admin users
    if (userAccess === 'admin') {
      baseItems.push({
        key: 'incoming-wireline-payments',
        label: <Link to="/incoming-wireline-payments">Incoming Wireline Payments</Link>,
        icon: <UnorderedListOutlined />,
      });
    }

    const menuItems = [...baseItems];

    // Only show upload options for admin users
    if (userAccess === 'admin') {
      menuItems.push(
        {
          type: 'divider',
        },
        {
          key: 'residual-upload',
          label: <span>Residual Statement Upload</span>,
          icon: <UploadOutlined />,
        },
        {
          key: 'wireline-upload',
          label: <span>Wireline Statement Upload</span>,
          icon: <CloudUploadOutlined />,
        },
        {
          key: 'callidus-upload',
          label: <span>Callidus Statement Upload</span>,
          icon: <CloudUploadOutlined />,
        }
      );
    }

    return menuItems;
  };

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 16px', 
      height: '48px', 
      lineHeight: '48px',
      justifyContent: 'space-between'
    }}>
      {/* Menu and Logo section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        minWidth: '200px'
      }}>
        <Dropdown 
          menu={{ items: getMenuItems() }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <AppstoreOutlined 
            style={{ 
              fontSize: '20px', 
              color: 'white',
              marginRight: '16px',
              cursor: 'pointer'
            }} 
          />
        </Dropdown>
        <Link to="/residual-check" style={{ textDecoration: 'none' }}>
          <div className="logo" style={{ 
            color: 'white', 
            fontSize: '18px', 
            fontWeight: 'bold',
            display: 'flex', 
            alignItems: 'center',
            fontFamily: '"Source Sans Pro", "Nunito Sans", Helvetica, sans-serif'
          }}>
            <img src="/foxylogo.png" alt="Foxy Logo" style={{ height: '30px', marginRight: '8px' }} />
            Foxy Ledger
          </div>
        </Link>
      </div>

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
