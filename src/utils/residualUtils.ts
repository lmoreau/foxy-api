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
  index: number,
  isAutoMerged: boolean = false
): MergedRecord => {
  return {
    key: generateUniqueKey('merged', index, wirelineRecord.foxy_serviceid, residualRecord.foxyflow_residualserviceid),
    type: 'merged',
    isAutoMerged,
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
  hasAutoMerged: boolean;
} => {
  const result: (ResidualRecord | WirelineRecord | MergedRecord)[] = [];
  let totalResidualAmount = 0;
  let totalWirelineCharges = 0;
  let hasAutoMerged = false;

  // Group records by amount
  const residualsByAmount = new Map<number, ResidualRecord[]>();
  const wirelinesByAmount = new Map<number, WirelineRecord[]>();

  residuals.forEach(record => {
    const amount = normalizeAmount(record.foxyflow_actuals);
    if (!residualsByAmount.has(amount)) {
      residualsByAmount.set(amount, []);
    }
    residualsByAmount.get(amount)!.push(record);
  });

  wirelines.forEach(record => {
    const amount = normalizeAmount(record.foxy_charges);
    if (!wirelinesByAmount.has(amount)) {
      wirelinesByAmount.set(amount, []);
    }
    wirelinesByAmount.get(amount)!.push(record);
  });

  // Process each amount
  const processedAmounts = new Set<number>();

  // Function to process records with matching amounts
  const processMatchingAmounts = (amount: number) => {
    if (processedAmounts.has(amount)) return;
    processedAmounts.add(amount);

    const residualGroup = residualsByAmount.get(amount) || [];
    const wirelineGroup = wirelinesByAmount.get(amount) || [];

    // If we have equal numbers of residuals and wirelines for this amount
    if (residualGroup.length > 0 && residualGroup.length === wirelineGroup.length) {
      // Auto-merge all records with the same amount
      residualGroup.forEach((residual, idx) => {
        const wireline = wirelineGroup[idx];
        const mergedRecord = createMergedRecord(wireline, residual, globalIndex++, true);
        result.push(mergedRecord);
        totalResidualAmount += normalizeAmount(residual.foxyflow_actuals);
        totalWirelineCharges += normalizeAmount(wireline.foxy_charges);
      });
      hasAutoMerged = residualGroup.length > 1; // Set flag if we auto-merged multiple records
    } else {
      // Add records separately if counts don't match
      residualGroup.forEach(record => {
        result.push({
          ...record,
          type: 'residual',
          key: generateUniqueKey('residual', globalIndex++, accountId, record.foxyflow_product)
        });
        totalResidualAmount += normalizeAmount(record.foxyflow_actuals);
      });

      wirelineGroup.forEach(record => {
        result.push({
          ...record,
          type: 'wireline',
          key: generateUniqueKey('wireline', globalIndex++, accountId, record.foxy_serviceid)
        });
        totalWirelineCharges += normalizeAmount(record.foxy_charges);
      });
    }
  };

  // Process all amounts using Array.from to avoid iterator issues
  Array.from(new Set([...Array.from(residualsByAmount.keys()), ...Array.from(wirelinesByAmount.keys())])).forEach(amount => {
    processMatchingAmounts(amount);
  });

  return {
    records: result,
    totalResidualAmount,
    totalWirelineCharges,
    hasAutoMerged
  };
};

export const combineResidualData = (
  residualData: ResidualRecord[],
  wirelineData: WirelineRecord[],
  showUnmerged: boolean = false
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
        hasAutoMerged: false,
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
    const accountGroup = processAccount(
      accountId,
      maps.residuals.values().next().value?.[0]?.foxyflow_rogerscompanyname || 
      maps.wirelines.values().next().value?.[0]?.foxy_companyname || 
      'Unknown',
      globalIndex
    );

    if (showUnmerged) {
      // If showing unmerged, add all records separately
      maps.residuals.forEach((residuals, amount) => {
        residuals.forEach(record => {
          accountGroup.children.push({
            ...record,
            type: 'residual',
            key: generateUniqueKey('residual', globalIndex++, accountId, record.foxyflow_product)
          });
          accountGroup.totalResidualAmount += normalizeAmount(record.foxyflow_actuals);
        });
      });

      maps.wirelines.forEach((wirelines, amount) => {
        wirelines.forEach(record => {
          accountGroup.children.push({
            ...record,
            type: 'wireline',
            key: generateUniqueKey('wireline', globalIndex++, accountId, record.foxy_serviceid)
          });
          accountGroup.totalWirelineCharges += normalizeAmount(record.foxy_charges);
        });
      });
    } else {
      // Get all unique amounts using Array.from to avoid iterator issues
      const allAmounts = Array.from(new Set([
        ...Array.from(maps.residuals.keys()),
        ...Array.from(maps.wirelines.keys())
      ]));

      allAmounts.forEach(amount => {
        const residuals = maps.residuals.get(amount) || [];
        const wirelines = maps.wirelines.get(amount) || [];

        // If exactly one record exists in both sources, merge them
        if (residuals.length === 1 && wirelines.length === 1) {
          const mergedRecord = createMergedRecord(wirelines[0], residuals[0], globalIndex);
          accountGroup.children.push(mergedRecord);
          accountGroup.totalResidualAmount += normalizeAmount(residuals[0].foxyflow_actuals);
          accountGroup.totalWirelineCharges += normalizeAmount(wirelines[0].foxy_charges);
        } else {
          // Handle multiple matches (including auto-merging)
          const { records, totalResidualAmount, totalWirelineCharges, hasAutoMerged } = handleMultipleMatches(
            residuals,
            wirelines,
            accountId,
            globalIndex
          );
          accountGroup.children.push(...records);
          accountGroup.totalResidualAmount += totalResidualAmount;
          accountGroup.totalWirelineCharges += totalWirelineCharges;
          accountGroup.hasAutoMerged = accountGroup.hasAutoMerged || hasAutoMerged;
        }
        globalIndex++;
      });
    }

    // Sort children by amount in descending order
    accountGroup.children = accountGroup.children.sort((a, b) => {
      const amountA = getRecordAmount(a);
      const amountB = getRecordAmount(b);
      return amountB - amountA;
    });
  });

  return Array.from(groupedData.values());
};
