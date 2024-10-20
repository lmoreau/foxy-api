import { QuoteLineItem } from '../types/index';

export const createNewLineItem = (): QuoteLineItem => ({
  foxy_foxyquoterequestlineitemid: `new-${Date.now()}`,
  foxy_quantity: 0,
  foxy_each: 0,
  foxy_mrr: 0,
  foxy_linetcv: 0,
  foxy_term: 0,
  foxy_revenuetype: 0,
  foxy_renewaltype: '',
  foxy_renewaldate: '',
  foxy_Product: {
    name: '',
  },
});

export const handleAddLine = (locationId: string, newItem: QuoteLineItem) => {
  // This function should be implemented to add a new line item to the state
  // For now, we'll just log the action
  console.log(`Adding new line item to location ${locationId}:`, newItem);
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
