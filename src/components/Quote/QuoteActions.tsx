import React from 'react';
import { Button, Space, Modal, Tooltip, message } from 'antd';
import { PlusOutlined, ExpandAltOutlined, ShrinkOutlined, CopyOutlined, RollbackOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createQuoteRequest, createFoxyQuoteRequestLocation, updateQuoteRequest, createQuoteLineItem } from '../../utils/api';
import { QuoteActionsProps } from './types';
import { validateQuoteReadyForSubmit } from './utils';

const QuoteActions: React.FC<QuoteActionsProps> = ({
  onAddLocation,
  onToggleExpand,
  expandAll,
  quoteStage,
  quoteId,
  onRefresh,
  locations,
  lineItems,
  accountId,
  opportunityId,
  rawQuoteData
}) => {
  const navigate = useNavigate();
  const showQuoteActionButton = [612100000, 612100001, 612100002].includes(quoteStage);
  const isSubmitStage = quoteStage === 612100000 || quoteStage === 612100002;
  const isQuoteValid = validateQuoteReadyForSubmit(locations, lineItems);
  const showAddLocation = quoteStage === 612100000 || quoteStage === 612100002;

  const handleQuoteAction = async () => {
    const isSubmit = quoteStage === 612100000;
    const isResubmit = quoteStage === 612100002;
    const isRecall = quoteStage === 612100001;
    
    Modal.confirm({
      title: isSubmit ? 'Submit Quote' : isResubmit ? 'Resubmit Quote' : 'Recall Quote',
      content: isSubmit ? 
        'Are you sure you want to submit this quote?' : 
        isResubmit ?
        'Are you sure you want to resubmit this quote?' :
        'Are you sure you want to recall this quote?',
      onOk: async () => {
        try {
          if (!quoteId) {
            message.error('Quote ID is missing');
            return;
          }

          await updateQuoteRequest(quoteId, {
            foxy_quotestage: isRecall ? 612100000 : 612100001
          });

          message.success(`Quote ${isSubmit ? 'submitted' : isResubmit ? 'resubmitted' : 'recalled'} successfully`);
          await onRefresh();
        } catch (error) {
          console.error('Error updating quote stage:', error);
          message.error(`Failed to ${isSubmit ? 'submit' : isResubmit ? 'resubmit' : 'recall'} quote`);
        }
      }
    });
  };

  const handleCloneQuote = () => {
    Modal.confirm({
      title: 'Clone Quote',
      content: 'Are you sure you want to clone this quote?',
      onOk: async () => {
        try {
          console.log('Cloning quote with: ', {
            subject: rawQuoteData?.quoteRequest?.foxy_subject,
            quoteType: rawQuoteData?.quoteRequest?.foxy_quotetype
          });

          const newQuote = await createQuoteRequest({
            _foxy_account_value: accountId,
            _foxy_opportunity_value: opportunityId,
            foxy_subject: rawQuoteData?.quoteRequest?.foxy_subject,
            foxy_quotetype: rawQuoteData?.quoteRequest?.foxy_quotetype
          });

          if (newQuote.foxy_foxyquoterequestid) {
            // Create a map to store old location ID to new location ID mapping
            const locationMap = new Map<string, string>();

            // Create all locations first
            const locationPromises = locations.map(async location => {
              const newLocation = await createFoxyQuoteRequestLocation(
                location._foxy_building_value,
                newQuote.foxy_foxyquoterequestid,
                location._foxy_companylocation_value
              );
              // Store the mapping of old location ID to new location ID
              locationMap.set(location.foxy_foxyquoterequestlocationid, newLocation.foxy_foxyquoterequestlocationid);
              return newLocation;
            });

            await Promise.all(locationPromises);

            // Now create line items for each location
            const lineItemPromises: Promise<any>[] = [];

            locations.forEach(location => {
              const locationLineItems = lineItems[location.foxy_foxyquoterequestlocationid] || [];
              const newLocationId = locationMap.get(location.foxy_foxyquoterequestlocationid);

              if (newLocationId) {
                locationLineItems.forEach(item => {
                  // Skip if no product value
                  if (!item._foxy_product_value) {
                    console.warn('Skipping line item without product value:', item);
                    return;
                  }

                  // Create new line item with the same properties but for the new location
                  const lineItemPromise = createQuoteLineItem({
                    _foxy_foxyquoterequestlocation_value: newLocationId,
                    _foxy_product_value: item._foxy_product_value,
                    foxy_quantity: item.foxy_quantity,
                    foxy_each: item.foxy_each,
                    foxy_mrr: item.foxy_mrr,
                    foxy_linetcv: item.foxy_linetcv,
                    foxy_term: item.foxy_term,
                    foxy_revenuetype: item.foxy_revenuetype,
                    foxy_renewaltype: item.foxy_renewaltype,
                    foxy_renewaldate: item.foxy_renewaldate,
                    foxy_existingqty: item.foxy_existingqty,
                    foxy_existingmrr: item.foxy_existingmrr
                  });
                  lineItemPromises.push(lineItemPromise);
                });
              }
            });

            await Promise.all(lineItemPromises);
            message.success('Quote, locations, and line items cloned successfully');
            navigate(`/quote/${newQuote.foxy_foxyquoterequestid}`);
          }
        } catch (error) {
          message.error('Failed to clone quote');
          console.error('Clone error:', error);
        }
      }
    });
  };

  return (
    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      {showQuoteActionButton && (
        <Tooltip title={
          !isQuoteValid && isSubmitStage ? 
          "Quote cannot be submitted. Please ensure: \n• At least one location is added\n• Each location has at least one product\n• All required fields are filled in for each product" 
          : ""
        }>
          <Button 
            type="primary"
            icon={quoteStage === 612100001 ? <RollbackOutlined /> : <CheckCircleOutlined />}
            onClick={handleQuoteAction}
            disabled={!isQuoteValid}
          >
            {quoteStage === 612100000 ? 'Submit Quote' : 
             quoteStage === 612100002 ? 'Resubmit Quote' : 
             'Recall Quote'}
          </Button>
        </Tooltip>
      )}
      <Tooltip title={
        !isQuoteValid ? 
        "Cannot clone quote. Please ensure: \n• At least one location is added\n• Each location has at least one product\n• All required fields are filled in for each product" 
        : ""
      }>
        <Button 
          icon={<CopyOutlined />} 
          onClick={handleCloneQuote}
          disabled={!isQuoteValid}
        >
          Clone Quote
        </Button>
      </Tooltip>
      {showAddLocation && (
        <Button icon={<PlusOutlined />} onClick={onAddLocation}>
          Add Location
        </Button>
      )}
      <Button 
        icon={expandAll ? <ShrinkOutlined /> : <ExpandAltOutlined />} 
        onClick={onToggleExpand}
        style={{ padding: '4px 8px' }}
      >
      </Button>
    </Space>
  );
};

export default QuoteActions;
