import React from 'react';
import { Layout, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const QuoteCPQHeader: React.FC = () => {
  const getMenuItems = (): Required<MenuProps>['items'] => {
    return [
      {
        key: 'all-quotes',
        label: 'All Quote Requests',
      }
    ];
  };

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: 0, 
      height: '48px', 
      lineHeight: '48px',
      justifyContent: 'space-between'
    }}>
      {/* Menu and Logo section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        minWidth: '200px',
        paddingLeft: '16px'
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
        <div style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          display: 'flex', 
          alignItems: 'center',
          fontFamily: '"Source Sans Pro", "Nunito Sans", Helvetica, sans-serif'
        }}>
          <img src="/foxylogo.png" alt="Foxy Logo" style={{ height: '30px', marginRight: '8px' }} />
          Foxy CPQ
        </div>
      </div>

      {/* Right side - just the avatar for now */}
      <div style={{ 
        minWidth: '200px',
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: '16px'
      }}>
        <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
      </div>
    </Header>
  );
};

export default QuoteCPQHeader; 