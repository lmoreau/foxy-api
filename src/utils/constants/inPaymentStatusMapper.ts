export const inPaymentStatusMapper: { [key: number]: string } = {
    612100000: "Pending",
    612100001: "Paid in Full",
    612100002: "Partially Paid",
    612100003: "Needs Review",
    612100004: "Disputed",
    612100005: "Overpaid",
    612100006: "Underpaid",
    612100007: "$0 Renewal - On Renewal List",
    612100008: "Dispute Needed",
    612100009: "$0 Renewal - On Q4 List",
    612100010: "$0 Renewal - Check Validity",
    612100011: "$0 Renewal - On Both Lists",
    612100012: "Non-Commissionable"
};

export const getInPaymentStatus = (value: number): string => {
    return inPaymentStatusMapper[value] || `Unknown Value (${value})`;
};
