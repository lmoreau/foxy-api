import { formatCurrency } from './formatters';

export function getCommissionRate(marginPercent: number): number {
    if (marginPercent < 5) return 0;
    if (marginPercent < 15) return 0.06;
    if (marginPercent < 30) return 0.10;
    if (marginPercent < 50) return 0.14;
    if (marginPercent < 60) return 0.20;
    return 0.22;
}

interface BaseItem {
    foxy_revenuetype: number;
    foxy_renewaltype?: string;
    foxy_term: number;
    foxy_mrr: number;
}

interface WonServiceItem extends BaseItem {
    foxy_mrruptick: number | null;
    foxy_tcv: number;
    foxy_linemargin: number;
}

interface QuoteLineItem extends BaseItem {
    foxy_linetcv: number;
    foxy_existingmrr?: number;
}

export function calculateExpectedComp(
    item: WonServiceItem | QuoteLineItem,
    assumedMarginPercent?: number
): { comp: number; explanation: string } {
    // For quotes, we use assumed margin. For won services, we use actual margin
    const marginPercent = 'foxy_linemargin' in item 
        ? (item as WonServiceItem).foxy_linemargin * 100 
        : (assumedMarginPercent || 20);

    // Get TCV based on item type
    const tcv = 'foxy_tcv' in item 
        ? (item as WonServiceItem).foxy_tcv 
        : (item as QuoteLineItem).foxy_linetcv;

    // NEW or NET NEW
    if (item.foxy_revenuetype === 612100000 || item.foxy_revenuetype === 612100001) {
        const rate = getCommissionRate(marginPercent);
        const comp = tcv * rate;
        return {
            comp,
            explanation: `${formatCurrency(item.foxy_mrr)}/mo * ${item.foxy_term} months * ${(rate * 100).toFixed(0)}% = ${formatCurrency(comp)}`
        };
    }

    // UPSELL or RENEWAL
    if (item.foxy_revenuetype === 612100002 || item.foxy_revenuetype === 612100003) {
        // Early Renewal gets no compensation
        if (item.foxy_renewaltype === "Early Renewal") {
            return {
                comp: 0,
                explanation: "Early Renewal - No compensation"
            };
        }

        // Calculate MRR uptick
        let mrrUptick: number | null = null;
        if ('foxy_mrruptick' in item) {
            mrrUptick = (item as WonServiceItem).foxy_mrruptick;
        } else if ('foxy_existingmrr' in item && item.foxy_existingmrr) {
            mrrUptick = item.foxy_mrr - item.foxy_existingmrr;
        }

        // If there's a positive MRR uptick, split the calculation
        if (mrrUptick && mrrUptick > 0) {
            const existingMRR = 'foxy_existingmrr' in item 
                ? (item.foxy_existingmrr || 0)
                : (item.foxy_mrr - mrrUptick);
            
            const existingTCV = existingMRR * item.foxy_term;
            const existingComp = existingTCV * 0.05;

            const newTCV = mrrUptick * item.foxy_term;
            const newRate = getCommissionRate(marginPercent);
            const newComp = newTCV * newRate;

            return {
                comp: existingComp + newComp,
                explanation: `Existing: ${formatCurrency(existingMRR)}/mo * ${item.foxy_term} months * 5% = ${formatCurrency(existingComp)}\nNew: ${formatCurrency(mrrUptick)}/mo * ${item.foxy_term} months * ${(newRate * 100).toFixed(0)}% = ${formatCurrency(newComp)}`
            };
        }

        // Regular renewal or upsell without uptick gets 5%
        const comp = tcv * 0.05;
        const type = item.foxy_revenuetype === 612100002 ? "Upsell (no uptick)" : "Regular Renewal";
        return {
            comp,
            explanation: `${type}: ${formatCurrency(item.foxy_mrr)}/mo * ${item.foxy_term} months * 5% = ${formatCurrency(comp)}`
        };
    }

    return {
        comp: 0,
        explanation: "No matching compensation rules"
    };
}
