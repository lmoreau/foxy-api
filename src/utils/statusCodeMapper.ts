export const getStatusCodeLabel = (code: number | string): string => {
  const statusCodes: { [key: string]: string } = {
    '1': 'In Progress',
    '2': 'On Hold',
    '3': 'Won',
    '4': 'Went with another provider',
    '5': 'No budget for proposed solution',
    '612100000': 'Disengaging due to ROE conflict',
    '612100001': 'Service availability issues / install time',
    '612100002': 'Customer has gone silent',
    '612100003': 'On contract with current provider',
    '612100004': 'Not the right time to move forward',
    '612100005': 'Relationship with current provider',
    '612100006': 'Length of term / Can\'t sign a contract',
    '612100007': 'Duplicate / Foxy Clean-Up',
    '612100008': 'Other (Please notify Lee to add the actual reason)',
    '755280001': 'Deal Desk unable to match competitor',
    '755280003': 'Cha Cha Charm'
  };

  const codeString = code?.toString() || '';
  return statusCodes[codeString] || `Unknown Status (${code})`;
};
