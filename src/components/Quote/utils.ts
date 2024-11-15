import { QuoteLocation, QuoteLineItem } from '../../types';

export const validateQuoteReadyForSubmit = (locations: QuoteLocation[], lineItems: { [key: string]: QuoteLineItem[] }): boolean => {
  // Check if there's at least one location
  if (!locations || locations.length === 0) return false;

  // Check each location
  for (const location of locations) {
    const locationId = location.foxy_foxyquoterequestlocationid;
    const locationLineItems = lineItems[locationId];

    // Check if location has at least one line item
    if (!locationLineItems || locationLineItems.length === 0) return false;

    // Check each line item in this location
    for (const item of locationLineItems) {
      // Basic required fields for all items
      if (!item.foxy_Product?.name || 
          item.foxy_revenuetype === undefined || 
          !item.foxy_term || 
          !item.foxy_quantity || 
          item.foxy_each === undefined) {
        return false;
      }

      // Additional fields required for Upsell (612100002) and Renewal (612100003)
      if (item.foxy_revenuetype === 612100002 || item.foxy_revenuetype === 612100003) {
        if (!item.foxy_renewaltype || 
            !item.foxy_renewaldate || 
            item.foxy_existingqty === undefined || 
            item.foxy_existingmrr === undefined) {
          return false;
        }
      }
    }
  }

  return true;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
