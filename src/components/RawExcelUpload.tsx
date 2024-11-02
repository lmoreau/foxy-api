import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { message } from 'antd';

const RawExcelUpload: React.FC = (): JSX.Element => {
  const [data, setData] = useState<any[]>([]);

  const convertExcelDate = (serial: number): string => {
    if (!serial) return '';
    
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    
    const year = dateInfo.getUTCFullYear();
    const month = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateInfo.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const transformRow = (row: any) => {
    const { __EMPTY, ...rest } = row;
    const dateFields = [
      'Order Date',
      'Transaction Date',
      'Effective Date',
      'Original Actv Date',
      'Vesting Date',
      'Contract Start Date'
    ];

    const transformed = { ...rest };
    dateFields.forEach(field => {
      if (transformed[field]) {
        transformed[field] = convertExcelDate(transformed[field]);
      }
    });

    // Rename fields
    const fieldMappings = {
      'Order Number': 'COP',
      'Dispute Number': 'Comp Comments',
      'Net New MRR': 'Total MRR',
      'NET TCV': 'TCV',
      'Transaction Date': 'Won Date',
      'Activity Code': 'Revenue Type',
      'Product Code Desc': 'Product Name',
      'Product Group': 'Product Category',
      'Units': 'Quantity',
      'Margin Percentage': 'Margin',
      'Compensation Amount': 'Payment Amount'
    };

    Object.entries(fieldMappings).forEach(([oldName, newName]) => {
      if (oldName in transformed) {
        transformed[newName] = transformed[oldName];
        delete transformed[oldName];
      }
    });

    return transformed;
  };

  const filterOpticFields = (row: any) => {
    const fieldsToRemove = [
      'Vesting Date',
      'Vesting Owner',
      'Partner Employee ID',
      'Dealer Code',
      'Tier',
      'Dealer Type',
      'Partner Name',
      'IDV',
      'Dlr Por Act',
      'Phone Number',
      'Old Phone Number',
      'LNP Port Indicator',
      'LNP Port From',
      'LNP Port To',
      'Vesting MSF',
      'Payment Method',
      'NAC MSF Covered Ind',
      'TOPUP Towards NAC MSF',
      'Auto Enrollment Ind',
      'SOC TERM',
      'CTN MARGIN PERCENT CALC',
      'Serial Number',
      'Device Model',
      'Device Desc',
      'SIM ID',
      'Prior Serial Number',
      'Prior Device Model',
      'HST/GST Tax Code',
      'HST / GST',
      'QST/PST Tax Code',
      'QST / PST',
      'Total',
      'Security Deposit',
      'Subsidy Amount',
      'Promo $',
      'Company (MSD) Code',
      'First Name',
      'Source Event Code',
      'Finance Indicator',
      'Installment\nIndicator',
      'Hardware Paid\nIndicator',
      'Upfront Edge Indicator',
      'Account Desc',
      'Old Account Number',
      'Agreement Name',
      'Related Company Code',
      'Named Account Activity',
      'Province Code',
      'Activity Reason Code',
      'Activity Reason Code Desc',
      'Primary Activity Code',
      'Product Code',
      'Prior Product Code',
      'Service Category',
      'Old Service Category',
      'Agreement ID',
      'DF IND',
      'MSF',
      'Prior MSF',
      'Last Name',
      'Order Date',
      'Original Actv Date',
      'Margin',
      'DISCOUNT PERCENT',
      'Subtotal',
      'Activity Code Desc'
    ];

    const filteredRow = { ...row };
    fieldsToRemove.forEach(field => {
      delete filteredRow[field];
    });

    return filteredRow;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        if (typeof bstr === 'string') {
          try {
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawJson = XLSX.utils.sheet_to_json(firstSheet);
            const transformedData = rawJson.map(transformRow);
            setData(transformedData);
            message.success(`File uploaded successfully with ${transformedData.length} rows`);
          } catch (error) {
            console.error('Error parsing Excel:', error);
            message.error('Failed to parse Excel file');
          }
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const getGroupedData = () => {
    const opticData = data
      .filter(row => row.Segment === 'OPTIC')
      .map(filterOpticFields);
    const otherData = data.filter(row => row.Segment !== 'OPTIC');

    return {
      OPTIC: opticData,
      Other: otherData
    };
  };

  const groupedData = data.length > 0 ? getGroupedData() : null;

  return (
    <div style={{ padding: '24px' }}>
      <h1>Raw Excel Upload</h1>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
          style={{ marginRight: '16px' }}
        />
      </div>
      {data.length > 0 && (
        <div style={{ 
          padding: '16px',
          background: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Total Records: {data.length} (OPTIC: {groupedData?.OPTIC.length}, Other: {groupedData?.Other.length})
        </div>
      )}
      {groupedData && (
        <div>
          <h3>Parsed Data:</h3>
          <textarea
            value={JSON.stringify({
              OPTIC: groupedData.OPTIC,
              Other: groupedData.Other
            }, null, 2)}
            readOnly
            style={{ 
              width: '100%',
              height: '500px',
              fontFamily: 'monospace',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: '4px'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RawExcelUpload;
