export const renewalDispositionMapper: { [key: number]: string } = {
    612100000: "Can't Renew due to ROE",
    612100001: "In Renewal Period",
    612100002: "Lead Created",
    612100003: "Lost to Competitor",
    612100004: "Not In Renewal Period",
    612100005: "Opportunity Created",
    612100006: "Remaining Month to Month",
    612100007: "Renewal Missed",
    612100008: "Renewal Not Eligible",
    612100009: "Renewed by Infusion",
    612100010: "Service Cancelled",
    612100011: "Other",
    612100012: "Renewed by Rogers",
    612100013: "Renewed by VAR/Dealer"
};

export const getRenewalDisposition = (value: number): string => {
    return renewalDispositionMapper[value] || `Unknown Value (${value})`;
};
