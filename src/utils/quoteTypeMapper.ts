export const quoteTypeMap: Record<number, string> = {
  612100000: 'Wireline',
  612100001: 'Wireless', 
  612100002: 'Data Centre',
  612100003: 'IoT',
  612100004: 'Small Business'
};

export const getQuoteTypeLabel = (value: number): string => {
  return quoteTypeMap[value] || 'Unknown';
};
