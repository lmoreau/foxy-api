import React from 'react';
import BaseLayout from './BaseLayout';
import Header from '../components/Header';

interface CPQLayoutProps {
  children: React.ReactNode;
}

const CPQLayout: React.FC<CPQLayoutProps> = ({ children }) => {
  return (
    <BaseLayout header={<Header />}>
      {children}
    </BaseLayout>
  );
};

export default CPQLayout;
