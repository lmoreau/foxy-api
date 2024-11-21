import React, { useEffect, useState } from 'react';
import { Layout, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  AppstoreOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { checkUserAccess, UserAccessLevel } from '../auth/authService';
import './Header.css';

const { Header } = Layout;

interface AppHeaderProps {
  quoteRequestId?: string;
  newProp?: string;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const [_userAccess, setUserAccess] = useState<UserAccessLevel>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { id } = useParams<{ id: string }>();

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
        key: 'view-in-crm',
        label: (
          <a 
            href={`https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&forceUCI=1&pagetype=entityrecord&etn=foxy_foxyquoterequest&id=${id}`}
          >
            View in Foxy CRM
          </a>
        ),
        icon: <TeamOutlined />,
      }
    ];

    return baseItems;
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
        <div className="logo-container">
          <img src="/foxylogo.png" alt="Foxy Logo" className="logo-image" />
          <span className="logo-text">CPQ</span>
        </div>
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
