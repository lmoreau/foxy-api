import { WonService, GroupedData } from '../types/wonServices';

export const groupWonServicesByOpportunity = (services: WonService[]): GroupedData[] => {
    const grouped = Object.values(
        services.reduce((acc: { [key: string]: GroupedData }, item: WonService) => {
            const oppId = item.foxy_Opportunity?.foxy_sfdcoppid;
            if (!oppId) return acc;

            if (!acc[oppId]) {
                acc[oppId] = {
                    key: oppId,
                    foxy_sfdcoppid: oppId,
                    opportunity_name: item.foxy_Opportunity.name,
                    actualvalue: item.foxy_Opportunity.actualvalue,
                    actualclosedate: item.foxy_Opportunity.actualclosedate,
                    children: [],
                    isGroup: true
                };
            }
            acc[oppId].children?.push(item);
            return acc;
        }, {})
    );

    // Sort by actualclosedate in descending order
    return grouped.sort((a, b) => {
        const dateA = new Date(a.actualclosedate).getTime();
        const dateB = new Date(b.actualclosedate).getTime();
        return dateB - dateA;
    });
};
