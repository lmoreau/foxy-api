import { QuoteLineItem } from '../types/index';
import { deleteQuoteLocation as apiDeleteQuoteLocation } from './api';

export const createNewLineItem = (): QuoteLineItem => ({
  foxy_foxyquoterequestlineitemid: `new-${Date.now()}`,
  foxy_quantity: 1,
  foxy_each: 0,
  foxy_mrr: 0,
  foxy_linetcv: 0,
  foxy_term: 12,
  foxy_revenuetype: 0,
  foxy_renewaltype: '',
  foxy_renewaldate: '',
  foxy_existingqty: 0,
  foxy_existingmrr: 0,
  foxy_Product: {
    name: '',
  },
});

export const handleAddLine = (locationId: string, newItem: QuoteLineItem) => {
  // This function should be implemented to add a new line item to the state
  return {
    ...newItem,
    foxy_foxyquoterequestlocationid: locationId
  };
};

export const calculateTotals = (lineItems: { [key: string]: QuoteLineItem[] }) => {
  let totalMRR = 0;
  let totalTCV = 0;

  Object.values(lineItems).forEach(locationItems => {
    locationItems.forEach(item => {
      totalMRR += item.foxy_mrr;
      totalTCV += item.foxy_linetcv;
    });
  });

  return { totalMRR, totalTCV };
};

export const deleteQuoteLocation = async (locationId: string): Promise<void> => {
  try {
    await apiDeleteQuoteLocation(locationId);
  } catch (error) {
    console.error('Error deleting quote location:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};
