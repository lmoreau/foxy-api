import { WirelineRecord, ResidualRecord, GroupedAccountData } from '../types/residualTypes';

export const generateUniqueKey = (prefix: string, index: number, ...parts: (string | number | undefined)[]): string => {
  const validParts = parts
    .map(part => part?.toString() || '')
    .filter(Boolean)
    .join('-');
  return `${prefix}-${index}-${validParts || 'empty'}`;
};

export const formatDescription = (record: WirelineRecord): string => {
  let desc = record.foxy_description || 'No Description';
  if (record.foxy_quantity > 1) {
    desc += ` x ${record.foxy_quantity}`;
  }
  if (record.foxy_contractterm) {
    desc += ` - ${record.foxy_contractterm} months`;
  }
  return desc;
};

export const combineResidualData = (
  residualData: ResidualRecord[],
  wirelineData: WirelineRecord[]
): GroupedAccountData[] => {
  const groupedData = new Map<string, GroupedAccountData>();

  // Process residual records
  residualData.forEach((item, index) => {
    const accountId = item.foxyflow_billingnumber;
    if (!groupedData.has(accountId)) {
      groupedData.set(accountId, {
        key: generateUniqueKey('account', index, accountId),
        accountId,
        companyName: item.foxyflow_rogerscompanyname,
        totalResidualAmount: 0,
        totalWirelineCharges: 0,
        children: []
      });
    }
    
    const group = groupedData.get(accountId)!;
    group.totalResidualAmount += parseFloat(item.foxyflow_actuals || '0');
    group.children.push({
      ...item,
      type: 'residual',
      key: generateUniqueKey('residual', index, accountId, item.foxyflow_product)
    });
  });

  // Process wireline records
  wirelineData.forEach((item, index) => {
    const accountId = item.foxy_signacct;
    if (!groupedData.has(accountId)) {
      groupedData.set(accountId, {
        key: generateUniqueKey('account', index, accountId),
        accountId,
        companyName: item.foxy_companyname,
        totalResidualAmount: 0,
        totalWirelineCharges: 0,
        children: []
      });
    }
    
    const group = groupedData.get(accountId)!;
    group.totalWirelineCharges += parseFloat(item.foxy_charges || '0');
    group.children.push({
      ...item,
      type: 'wireline',
      key: generateUniqueKey('wireline', index, accountId, item.foxy_serviceid)
    });
  });

  return Array.from(groupedData.values());
};
