import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

interface BaseLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  contentStyle?: React.CSSProperties;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  children, 
  header,
  contentStyle 
}) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {header}
      <Content style={{
        padding: '24px 50px',
        backgroundColor: '#f0f2f5',
        ...contentStyle
      }}>
        {children}
      </Content>
    </Layout>
  );
};

export default BaseLayout;
