export const buildingTypeMap: Record<number, string> = {
    612100001: 'Single-Tenant Office',
    612100002: 'Multi-Tenant Office',
    612100003: 'High-Rise / Large Office Building',
    612100004: 'Plaza/Strip/Mall',
    612100005: 'Data Centre',
    612100006: 'Residential',
    612100007: 'School or Hospital',
    612100008: 'Government Building'
};

export const getBuildingTypeLabel = (value: number): string => {
    return buildingTypeMap[value] || 'Unknown';
};
