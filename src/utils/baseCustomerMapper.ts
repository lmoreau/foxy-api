export const baseCustomerMap: Record<number, string> = {
    612100000: 'No',
    612100001: 'In Base',
    612100002: 'Non-Owned Base',
    947760001: 'Dumped'
};

export const getBaseCustomerLabel = (value: number): string => {
    return baseCustomerMap[value] || 'Unknown';
}; 