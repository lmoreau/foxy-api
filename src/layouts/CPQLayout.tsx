import React from 'react';
import BaseLayout from './BaseLayout';
import QuoteCPQHeader from '../components/QuoteCPQHeader';

interface CPQLayoutProps {
  children: React.ReactNode;
}

const CPQLayout: React.FC<CPQLayoutProps> = ({ children }) => {
  return (
    <BaseLayout header={<QuoteCPQHeader />}>
      {children}
    </BaseLayout>
  );
};

export default CPQLayout;
