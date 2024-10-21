export const quoteStageMap: Record<number, string> = {
  612100000: 'Draft',
  612100001: 'In Queue',
  612100002: 'Pending Sales',
  612100003: 'Submitted to SA',
  612100004: 'Pending COR',
  612100005: 'Pending 3rd Party/MAT',
  612100006: 'NIKA Requested',
  612100007: 'Finance Review',
  612100008: 'Waiting on CSE',
  755280001: 'MAT with DBM',
  612100009: 'Completed',
  612100010: 'Technical Review'
};

export const getQuoteStageLabel = (value: number): string => {
  return quoteStageMap[value] || 'Unknown';
};
