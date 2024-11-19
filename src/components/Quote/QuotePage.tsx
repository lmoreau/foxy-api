import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import message from 'antd/lib/message';
import { useQuoteData } from '../../hooks/useQuoteData';
import { useModal } from '../../hooks/useModal';
import { deleteQuoteLocation } from '../../utils/quoteUtils';
import { deleteQuoteLineItem, updateQuoteRequest } from '../../utils/api';
import { checkUserAccess } from '../../auth/authService';
import QuoteCPQHeader from '../QuoteCPQHeader';
import AddLocationModal from '../modals/AddLocationModal';
import TimelineTab from './TimelineTab';
import { QuotePageProps, RawQuoteData } from './types';
import MainTab from './MainTab';
import {
  Layout,
  Content,
  LazyTabs,
  Spin
} from './AntComponents';
import DetailsTab from './DetailsTab';

// Lazy load components that aren't immediately needed
const RawDataTab = lazy(() => import('./RawDataTab'));
const CompensationTab = lazy(() => import('./CompensationTab'));

// Add this new component
const RawDataTabs: React.FC<{ data: any }> = ({ data }) => {
  const items = [
    {
      key: 'lineItems',
      label: 'Line Items',
      children: <RawDataTab data={data.lineItems} />
    },
    {
      key: 'locations',
      label: 'Locations',
      children: <RawDataTab data={data.locations} />
    },
    {
      key: 'quoteRequest',
      label: 'Quote Request',
      children: <RawDataTab data={data.quoteRequest} />
    }
  ];

  return <LazyTabs items={items} />;
};

const QuotePage: React.FC<QuotePageProps> = ({ setQuoteRequestId }) => {
  const { id } = useParams<{ id: string }>();
  const { 
    accountName, 
    quoteId, 
    locations, 
    lineItems, 
    error, 
    loading, 
    owninguser, 
    accountId, 
    refetchLocations,
    rawQuoteData,
    refetch 
  } = useQuoteData(id);
  const { isVisible, show, hide } = useModal();
  const [expandAll, setExpandAll] = useState(true);
  const [rawData, setRawData] = useState<RawQuoteData>({
    lineItems: {},
    locations: [],
    quoteRequest: {}
  });
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editSubjectValue, setEditSubjectValue] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const access = await checkUserAccess();
      setIsAdmin(access === 'admin');
    };
    checkAdminAccess();
  }, []);

  useEffect(() => {
    setQuoteRequestId(quoteId);
  }, [quoteId, setQuoteRequestId]);

  useEffect(() => {
    if (rawQuoteData) {
      setRawData(rawQuoteData);
    }
  }, [rawQuoteData]);

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
  };

  const handleAddLocationSuccess = () => {
    hide();
    refetchLocations();
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const locationLineItems = lineItems[locationId] || [];
      for (const item of locationLineItems) {
        await deleteQuoteLineItem(item.foxy_foxyquoterequestlineitemid);
      }
      await deleteQuoteLocation(locationId);
      message.success('Location deleted successfully');
      refetchLocations();
    } catch (error) {
      message.error('Failed to delete location');
      console.error('Delete location error:', error);
    }
  };

  const handleUpdateLineItem = async (locationId: string, updatedItem: any) => {
    try {
      await refetchLocations();
      const isNewItem = updatedItem?.foxy_foxyquoterequestlineitemid?.startsWith('temp-') || false;
      message.success(`Line item ${isNewItem ? 'created' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error updating line item:', error);
      message.error('Failed to update line item');
    }
  };

  const handleDeleteLineItem = async (_locationId: string, _itemId: string) => {
    await refetchLocations();
  };

  const handleAddLineItem = async (_locationId: string, _newItem: any) => {
    await refetchLocations();
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '12px' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: rawQuoteData.quoteRequest?.foxy_quoteid || 'New Quote',
      children: (
        <MainTab
          accountName={accountName}
          rawQuoteData={rawQuoteData}
          locations={locations}
          lineItems={lineItems}
          error={error}
          expandAll={expandAll}
          isEditingSubject={isEditingSubject}
          editSubjectValue={editSubjectValue}
          owninguser={owninguser}
          id={id || ''}
          accountId={accountId}
          show={show}
          toggleExpandAll={toggleExpandAll}
          refetch={refetch}
          setEditSubjectValue={setEditSubjectValue}
          setIsEditingSubject={setIsEditingSubject}
          handleAddLineItem={handleAddLineItem}
          handleDeleteLocation={handleDeleteLocation}
          handleUpdateLineItem={handleUpdateLineItem}
          handleDeleteLineItem={handleDeleteLineItem}
          updateQuoteRequest={updateQuoteRequest}
        />
      ),
    },
    {
      key: '2',
      label: 'Details',
      children: (
        <DetailsTab 
          opportunity={rawQuoteData.quoteRequest?.foxy_Opportunity}
          account={rawQuoteData.quoteRequest?.foxy_Account}
          subject={rawQuoteData.quoteRequest?.foxy_subject}
          opportunityId={rawQuoteData.quoteRequest?._foxy_opportunity_value}
          quoteId={id}
          foxyQuoteId={rawQuoteData.quoteRequest?.foxy_quoteid}
        />
      ),
    },
    {
      key: '3',
      label: 'Notes',
      children: <TimelineTab id={id || ''} />,
    },
    {
      key: '4',
      label: 'Compensation',
      children: (
        <Suspense fallback={<Spin size="large" />}>
          <CompensationTab lineItems={lineItems} locations={locations} />
        </Suspense>
      ),
    },
    {
      key: '5',
      label: 'Raw Data',
      children: (
        <Suspense fallback={<Spin size="large" />}>
          <RawDataTabs data={rawData} />
        </Suspense>
      ),
    }
  ];

  // Show only the first two tabs for non-admin users (Quote and Notes)
  const visibleTabs = isAdmin ? tabItems : [tabItems[0], tabItems[1]];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <QuoteCPQHeader />
      <Content style={{ padding: '20px 50px' }}>
        <LazyTabs items={visibleTabs} />
      </Content>
      <AddLocationModal
        isVisible={isVisible}
        onOk={handleAddLocationSuccess}
        onCancel={hide}
        quoteRequestId={id || ''}
        accountId={accountId}
        onRefresh={refetchLocations}
      />
    </Layout>
  );
};

export default QuotePage;
