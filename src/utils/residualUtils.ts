import { WirelineRecord, ResidualRecord, GroupedAccountData, MergedRecord } from '../types/residualTypes';

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

const normalizeAmount = (amount: string | undefined): number => {
  if (!amount) return 0;
  return parseFloat(amount) || 0;
};

const getRecordAmount = (record: ResidualRecord | WirelineRecord | MergedRecord): number => {
  if (record.type === 'merged') {
    return normalizeAmount(record.wirelineRecord.foxy_charges);
  } else if (record.type === 'wireline') {
    return normalizeAmount(record.foxy_charges);
  } else {
    return normalizeAmount(record.foxyflow_actuals);
  }
};

const createMergedRecord = (
  wirelineRecord: WirelineRecord,
  residualRecord: ResidualRecord,
  index: number
): MergedRecord => {
  return {
    key: generateUniqueKey('merged', index, wirelineRecord.foxy_serviceid, residualRecord.foxyflow_residualserviceid),
    type: 'merged',
    // From WirelineRecord
    foxy_serviceid: wirelineRecord.foxy_serviceid,
    foxy_description: wirelineRecord.foxy_description,
    foxy_charges: wirelineRecord.foxy_charges,
    foxy_addressline1: wirelineRecord.foxy_addressline1,
    foxy_city: wirelineRecord.foxy_city,
    foxy_province: wirelineRecord.foxy_province,
    foxy_postalcode: wirelineRecord.foxy_postalcode,
    foxy_quantity: wirelineRecord.foxy_quantity,
    foxy_contractterm: wirelineRecord.foxy_contractterm,
    foxy_estimatedenddate: wirelineRecord.foxy_estimatedenddate,
    foxy_billingeffectivedate: wirelineRecord.foxy_billingeffectivedate,
    foxy_companyname: wirelineRecord.foxy_companyname,
    foxy_sitename: wirelineRecord.foxy_sitename,
    // From ResidualRecord
    foxyflow_charge_item_code: residualRecord.foxyflow_charge_item_code,
    foxyflow_residualserviceid: residualRecord.foxyflow_residualserviceid,
    // Store original records
    wirelineRecord,
    residualRecord
  };
};

const handleMultipleMatches = (
  residuals: ResidualRecord[],
  wirelines: WirelineRecord[],
  accountId: string,
  globalIndex: number
): {
  records: (ResidualRecord | WirelineRecord | MergedRecord)[];
  totalResidualAmount: number;
  totalWirelineCharges: number;
} => {
  const result: (ResidualRecord | WirelineRecord | MergedRecord)[] = [];
  let totalResidualAmount = 0;
  let totalWirelineCharges = 0;

  // Check if all residuals are MULTISER
  const allMultiser = residuals.every(r => r.foxyflow_product === 'MULTISER');
  
  if (allMultiser && residuals.length > 0 && wirelines.length > 0) {
    // Pair MULTISER records with wireline records one-to-one
    const maxPairs = Math.min(residuals.length, wirelines.length);
    
    for (let i = 0; i < maxPairs; i++) {
      const mergedRecord = createMergedRecord(wirelines[i], residuals[i], globalIndex + i);
      result.push(mergedRecord);
      totalResidualAmount += normalizeAmount(residuals[i].foxyflow_actuals);
      totalWirelineCharges += normalizeAmount(wirelines[i].foxy_charges);
    }
    
    // Add remaining records separately
    residuals.slice(maxPairs).forEach(record => {
      result.push({
        ...record,
        type: 'residual',
        key: generateUniqueKey('residual', globalIndex++, accountId, record.foxyflow_product)
      });
      totalResidualAmount += normalizeAmount(record.foxyflow_actuals);
    });
    
    wirelines.slice(maxPairs).forEach(record => {
      result.push({
        ...record,
        type: 'wireline',
        key: generateUniqueKey('wireline', globalIndex++, accountId, record.foxy_serviceid)
      });
      totalWirelineCharges += normalizeAmount(record.foxy_charges);
    });
  } else {
    // Non-MULTISER or mixed case - keep all records separate
    residuals.forEach(record => {
      result.push({
        ...record,
        type: 'residual',
        key: generateUniqueKey('residual', globalIndex++, accountId, record.foxyflow_product)
      });
      totalResidualAmount += normalizeAmount(record.foxyflow_actuals);
    });

    wirelines.forEach(record => {
      result.push({
        ...record,
        type: 'wireline',
        key: generateUniqueKey('wireline', globalIndex++, accountId, record.foxy_serviceid)
      });
      totalWirelineCharges += normalizeAmount(record.foxy_charges);
    });
  }

  return {
    records: result,
    totalResidualAmount,
    totalWirelineCharges
  };
};

export const combineResidualData = (
  residualData: ResidualRecord[],
  wirelineData: WirelineRecord[]
): GroupedAccountData[] => {
  const groupedData = new Map<string, GroupedAccountData>();

  // First, group records by account
  const processAccount = (accountId: string, companyName: string, index: number) => {
    if (!groupedData.has(accountId)) {
      groupedData.set(accountId, {
        key: generateUniqueKey('account', index, accountId),
        accountId,
        companyName,
        totalResidualAmount: 0,
        totalWirelineCharges: 0,
        children: []
      });
    }
    return groupedData.get(accountId)!;
  };

  // Create maps of amounts to records for each account
  const accountAmountMaps = new Map<string, {
    residuals: Map<number, ResidualRecord[]>,
    wirelines: Map<number, WirelineRecord[]>
  }>();

  // Process residual records
  residualData.forEach(item => {
    const accountId = item.foxyflow_billingnumber;
    const amount = normalizeAmount(item.foxyflow_actuals);
    
    if (!accountAmountMaps.has(accountId)) {
      accountAmountMaps.set(accountId, {
        residuals: new Map(),
        wirelines: new Map()
      });
    }
    
    const maps = accountAmountMaps.get(accountId)!;
    if (!maps.residuals.has(amount)) {
      maps.residuals.set(amount, []);
    }
    maps.residuals.get(amount)!.push(item);
  });

  // Process wireline records
  wirelineData.forEach(item => {
    const accountId = item.foxy_signacct;
    const amount = normalizeAmount(item.foxy_charges);
    
    if (!accountAmountMaps.has(accountId)) {
      accountAmountMaps.set(accountId, {
        residuals: new Map(),
        wirelines: new Map()
      });
    }
    
    const maps = accountAmountMaps.get(accountId)!;
    if (!maps.wirelines.has(amount)) {
      maps.wirelines.set(amount, []);
    }
    maps.wirelines.get(amount)!.push(item);
  });

  // Process each account
  let globalIndex = 0;
  accountAmountMaps.forEach((maps, accountId) => {
    // Get all unique amounts from both maps
    const allAmounts = Array.from(new Set([
      ...Array.from(maps.residuals.keys()),
      ...Array.from(maps.wirelines.keys())
    ]));
    
    const accountGroup = processAccount(
      accountId,
      maps.residuals.values().next().value?.[0]?.foxyflow_rogerscompanyname || 
      maps.wirelines.values().next().value?.[0]?.foxy_companyname || 
      'Unknown',
      globalIndex
    );

    const children: (ResidualRecord | WirelineRecord | MergedRecord)[] = [];

    allAmounts.forEach(amount => {
      const residuals = maps.residuals.get(amount) || [];
      const wirelines = maps.wirelines.get(amount) || [];

      // If exactly one record exists in both sources, merge them
      if (residuals.length === 1 && wirelines.length === 1) {
        const mergedRecord = createMergedRecord(wirelines[0], residuals[0], globalIndex);
        children.push(mergedRecord);
        accountGroup.totalResidualAmount += normalizeAmount(residuals[0].foxyflow_actuals);
        accountGroup.totalWirelineCharges += normalizeAmount(wirelines[0].foxy_charges);
      } else {
        // Handle multiple matches (including MULTISER case)
        const { records, totalResidualAmount, totalWirelineCharges } = handleMultipleMatches(
          residuals,
          wirelines,
          accountId,
          globalIndex
        );
        children.push(...records);
        accountGroup.totalResidualAmount += totalResidualAmount;
        accountGroup.totalWirelineCharges += totalWirelineCharges;
      }
      globalIndex++;
    });

    // Sort children by amount in descending order
    accountGroup.children = children.sort((a, b) => {
      const amountA = getRecordAmount(a);
      const amountB = getRecordAmount(b);
      return amountB - amountA;
    });
  });

  return Array.from(groupedData.values());
};
