import React, { lazy, Suspense } from 'react';
import { Layout, Space, Row, Col, Input, Typography, Alert, Spin } from 'antd';

// Only lazy load larger or less frequently used components
const Tabs = lazy(() => import('antd/lib/tabs'));

const { Content } = Layout;
const { Text } = Typography;

// Loading fallback component
const LoadingFallback = () => <div style={{ padding: '8px' }}>Loading...</div>;

// Only wrap Tabs in lazy loading since it's a larger component
// and not needed immediately
export const LazyTabs: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <Tabs {...props} />
  </Suspense>
);

// Export commonly used components directly
export {
  Layout,
  Content,
  Space,
  Row,
  Col,
  Input,
  Text,
  Alert,
  Spin
};
