import React, { useEffect, useState } from 'react';
import { Layout, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  AppstoreOutlined, 
  UnorderedListOutlined, 
  UploadOutlined, 
  CloudUploadOutlined,
  SearchOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { checkUserAccess, UserAccessLevel } from '../auth/authService';
import './Header.css';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const [userAccess, setUserAccess] = useState<UserAccessLevel>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    if (userAccess === 'admin') {
      baseItems.push(
        {
          key: 'incoming-wireline-payments',
          label: <Link to="/incoming-wireline-payments">Callidus Wireline Payments</Link>,
          icon: <UnorderedListOutlined />,
        },
        {
          key: 'product-compensation',
          label: <Link to="/product-compensation">Product Profit Dashboard</Link>,
          icon: <DollarOutlined />,
        }
      );
    }

    const menuItems = [...baseItems];

    if (userAccess === 'admin') {
      menuItems.push(
        {
          type: 'divider',
        },
        {
          key: 'residual-upload',
          label: <Link to="/residual-upload">Residual Statement Upload</Link>,
          icon: <UploadOutlined />,
        },
        {
          key: 'wireline-upload',
          label: <Link to="/wireline-upload">Wireline Statement Upload</Link>,
          icon: <CloudUploadOutlined />,
        },
        {
          key: 'callidus-upload',
          label: <Link to="/raw-excel-upload">Callidus Statement Upload</Link>,
          icon: <CloudUploadOutlined />,
        }
      );
    }

    return menuItems;
  };

  return (
    <Header className="app-header">
      {/* Menu and Logo section */}
      <div className="header-left">
        <Dropdown 
          menu={{ items: getMenuItems() }}
          trigger={['click']}
          placement="bottomLeft"
          onOpenChange={setIsMenuOpen}
        >
          <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
            <AppstoreOutlined />
          </div>
        </Dropdown>
        <Link to="/residual-check" className="logo-link">
          <div className="logo">
            <div className="logo-container">
              <img src="/foxylogo.png" alt="Foxy Logo" className="logo-image" />
              <span className="logo-text">Foxy CPQ</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Avatar section */}
      <div className="header-right">
        <div className="user-avatar">
          <Avatar 
            icon={<UserOutlined />} 
            className="avatar-icon"
          />
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
