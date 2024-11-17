import React from 'react';
import BaseLayout from './BaseLayout';
import AppHeader from '../components/Header';

interface LedgerLayoutProps {
  children: React.ReactNode;
}

const LedgerLayout: React.FC<LedgerLayoutProps> = ({ children }) => {
  return (
    <BaseLayout header={<AppHeader />}>
      {children}
    </BaseLayout>
  );
};

export default LedgerLayout;
