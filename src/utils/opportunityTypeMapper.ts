export const getOpportunityTypeLabel = (code: number | string): string => {
  const opportunityTypes: { [key: string]: string } = {
    '612100000': 'Wireline',
    '612100001': 'Corporate Wireless (New)',
    '947760001': 'Corporate Wireless (Renewal)',
    '612100002': 'Small Business',
    '612100003': 'SD-WAN',
    '755280001': 'Managed Services',
    '755280002': 'Microsoft Teams'
  };

  const codeString = code?.toString() || '';
  return opportunityTypes[codeString] || `Unknown Type (${code})`;
};
