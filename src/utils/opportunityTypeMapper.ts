interface OpportunityTypeInfo {
  label: string;
  color: string;
}

export const getOpportunityTypeInfo = (code: number | string): OpportunityTypeInfo => {
  const opportunityTypes: { [key: string]: OpportunityTypeInfo } = {
    '612100000': { label: 'Wireline', color: 'blue' },
    '612100001': { label: 'Corporate Wireless (New)', color: 'purple' },
    '947760001': { label: 'Corporate Wireless (Renewal)', color: 'purple' },
    '612100002': { label: 'Small Business', color: 'cyan' },
    '612100003': { label: 'SD-WAN', color: 'geekblue' },
    '755280001': { label: 'Managed Services', color: 'green' },
    '755280002': { label: 'Microsoft Teams', color: 'volcano' }
  };

  const codeString = code?.toString() || '';
  return opportunityTypes[codeString] || { label: `Unknown Type (${code})`, color: 'default' };
};

// Keep the original function for backward compatibility
export const getOpportunityTypeLabel = (code: number | string): string => {
  return getOpportunityTypeInfo(code).label;
};
