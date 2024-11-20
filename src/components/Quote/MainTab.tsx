import React, { ChangeEvent } from 'react';
import { EditOutlined } from '@ant-design/icons';
import LocationsTable from '../tables/LocationsTable';
import QuoteActions from './QuoteActions';
import QuoteSummary from './QuoteSummary';
import WirelessQuoteMessage from './WirelessQuoteMessage';
import { calculateTotals } from '../../utils/quoteUtils';
import {
  Row,
  Col,
  Alert,
  Space,
  Input,
  Text
} from './AntComponents';

interface MainTabProps {
  accountName: string;
  rawQuoteData: any;
  locations: any[];
  lineItems: any;
  error: string | null;
  expandAll: boolean;
  isEditingSubject: boolean;
  editSubjectValue: string;
  owninguser: any;
  id: string;
  accountId: string;
  show: () => void;
  toggleExpandAll: () => void;
  refetch: () => Promise<void>;
  setEditSubjectValue: (value: string) => void;
  setIsEditingSubject: (value: boolean) => void;
  handleAddLineItem: (locationId: string, newItem: any) => void;
  handleDeleteLocation: (locationId: string) => void;
  handleUpdateLineItem: (locationId: string, updatedItem: any) => void;
  handleDeleteLineItem: (locationId: string, itemId: string) => void;
  updateQuoteRequest: (id: string, data: any) => Promise<void>;
}

const MainTab: React.FC<MainTabProps> = ({
  accountName,
  rawQuoteData,
  locations,
  lineItems,
  error,
  expandAll,
  isEditingSubject,
  editSubjectValue,
  owninguser,
  id,
  accountId,
  show,
  toggleExpandAll,
  refetch,
  setEditSubjectValue,
  setIsEditingSubject,
  handleAddLineItem,
  handleDeleteLocation,
  handleUpdateLineItem,
  handleDeleteLineItem,
  updateQuoteRequest,
}) => {
  const isWirelessQuote = rawQuoteData.quoteRequest?.foxy_quotetype === 612100001;

  return (
    <Row gutter={[0, 16]}>
      <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '16px', display: 'block' }}>{accountName}</Text>
          <Space>
            {isEditingSubject ? (
              <Input
                value={editSubjectValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditSubjectValue(e.target.value)}
                onPressEnter={async () => {
                  if (editSubjectValue !== rawQuoteData.quoteRequest?.foxy_subject) {
                    try {
                      await updateQuoteRequest(id, { foxy_subject: editSubjectValue });
                      await refetch();
                    } catch (error) {
                      console.error('Update subject error:', error);
                    }
                  }
                  setIsEditingSubject(false);
                }}
                onBlur={async () => {
                  if (editSubjectValue !== rawQuoteData.quoteRequest?.foxy_subject) {
                    try {
                      await updateQuoteRequest(id, { foxy_subject: editSubjectValue });
                      await refetch();
                    } catch (error) {
                      console.error('Update subject error:', error);
                    }
                  }
                  setIsEditingSubject(false);
                }}
                autoFocus
                style={{ minWidth: '500px' }}
              />
            ) : (
              <div 
                onClick={() => {
                  setEditSubjectValue(rawQuoteData.quoteRequest?.foxy_subject || '');
                  setIsEditingSubject(true);
                }}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '500px'
                }}
              >
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: '14px',
                    display: 'inline-block'
                  }}
                >
                  {rawQuoteData.quoteRequest?.foxy_subject || '-'}
                </Text>
                <EditOutlined style={{ color: '#00000073', flexShrink: 0 }} />
              </div>
            )}
          </Space>
        </div>
        <QuoteActions 
          onAddLocation={show}
          onToggleExpand={toggleExpandAll}
          expandAll={expandAll}
          onCloneQuote={async () => Promise.resolve()}
          quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
          quoteId={id}
          onRefresh={refetch}
          locations={locations}
          lineItems={lineItems}
          accountId={accountId}
          opportunityId={rawQuoteData.quoteRequest?._foxy_opportunity_value}
          rawQuoteData={rawQuoteData}
        />
      </Col>
      <Col span={24}>
        <QuoteSummary 
          owner={owninguser?.fullname || ''} 
          totalMRR={calculateTotals(lineItems).totalMRR} 
          totalTCV={calculateTotals(lineItems).totalTCV}
          quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
          quoteType={rawQuoteData.quoteRequest?.foxy_quotetype}
          opticQuote={rawQuoteData.quoteRequest?.foxy_opticquote || ''}
          onOpticQuoteEdit={async (value) => {
            try {
              await updateQuoteRequest(id, { foxy_opticquote: value });
              await refetch();
            } catch (error) {
              console.error('Update OptiC Quote error:', error);
            }
          }}
        />
      </Col>
      {error && (
        <Col span={24}>
          <Alert message="Error" description={error} type="error" showIcon />
        </Col>
      )}
      <Col span={24}>
        {isWirelessQuote ? (
          <WirelessQuoteMessage />
        ) : (
          <LocationsTable
            data={locations}
            lineItems={lineItems}
            onAddLine={handleAddLineItem}
            expandAll={expandAll}
            onDeleteLocation={handleDeleteLocation}
            onUpdateLineItem={handleUpdateLineItem}
            onDeleteLineItem={handleDeleteLineItem}
            quoteStage={rawQuoteData.quoteRequest?.foxy_quotestage}
          />
        )}
      </Col>
    </Row>
  );
};

export default MainTab;
