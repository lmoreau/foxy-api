export interface WonService {
    foxy_serviceid: string;
    foxy_comprate: number;
    foxy_expectedcomp: number;
    foxy_term: number;
    foxy_tcv: number;
    foxy_access: string;
    foxy_mrr: number;
    foxy_quantity: number;
    foxy_linemargin: number;
    foxy_wonserviceid: string;
    foxy_renewaldisposition: number;
    foxy_renewaltype: string;
    foxy_sololine: boolean;
    foxy_revenuetype: number;
    foxy_inpaymentstatus: number;
    foxy_mrruptick: number | null;
    crc9f_existingmrr: number | null;
    foxy_Product: {
        name: string;
        productid: string;
    };
    foxy_Account: {
        name: string;
        accountid: string;
    };
    foxy_Opportunity: {
        name: string;
        foxy_sfdcoppid: string;
        actualclosedate: string;
        actualvalue: number;
        opportunityid: string;
    };
    foxy_AccountLocation: {
        foxy_Building: {
            foxy_fulladdress: string;
            foxy_buildingid: string;
        };
    };
}

export interface GroupedData {
    key: string;
    foxy_sfdcoppid: string;
    opportunity_name: string;
    actualvalue: number;
    actualclosedate: string;
    children?: WonService[];
    isGroup: true;
}

export const isGroupData = (record: any): record is GroupedData => {
    return record && record.isGroup === true;
};

export const isWonService = (record: any): record is WonService => {
    return record && 'foxy_wonserviceid' in record;
};
