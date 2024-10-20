export const categoryMap: Record<number, string> = {
  612100000: 'Fibre Based',
  612100001: 'Cable Based',
  612100002: 'Data Centre',
  612100003: 'Microsoft 365',
  612100004: 'Wireless',
  612100006: 'IoT',
  612100007: 'Unison',
  612100008: 'Fixed Wireless',
  612100009: 'Managed Wifi',
  // Add more categories as needed
};

export const subcategoryMap: Record<number, string> = {
  612100000: 'Microsoft 365',
  612100001: 'SIP LD',
  612100029: 'Business Phone',
  612100002: 'Internet Bandwidth',
  612100003: 'GPON',
  612100004: 'RES Bandwidth',
  612100005: 'MPLS Bandwidth',
  612100006: 'Colocation',
  612100027: 'Cloud',
  612100028: 'DC Add-Ons',
  612100007: 'TV',
  612100008: 'Cable Internet',
  612100009: 'Phone Lines',
  612100010: 'SIP Trunking',
  612100011: 'Fibre Access',
  612100012: 'Add-Ons',
  612100013: 'LTE Backup',
  612100014: 'Unison Plans',
  612100015: 'Unison Features',
  612100016: 'Fixed Wireless',
  612100017: 'DDoS Protection',
  612100018: 'Project & Visio',
  612100019: 'Office 365',
  612100020: 'Phone System',
  612100021: 'All Others',
  612100022: 'Wavelength',
  612100023: 'Power BI',
  612100024: 'Managed Wifi',
  612100025: 'Biz Reg',
  612100026: 'Biz Corp',
  // Add more subcategories as needed
};

export const getCategoryLabel = (value: number): string => {
  return categoryMap[value] || 'Unknown';
};

export const getSubcategoryLabel = (value: number): string => {
  return subcategoryMap[value] || 'Unknown';
};
