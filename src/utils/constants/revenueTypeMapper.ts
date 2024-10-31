export const revenueTypeMapper: { [key: number]: string } = {
    612100000: "New",
    612100001: "Net New",
    612100002: "Upsell",
    612100003: "Renewal"
};

export const getRevenueType = (value: number): string => {
    return revenueTypeMapper[value] || `Unknown Value (${value})`;
};
