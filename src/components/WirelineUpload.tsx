import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface WirelineRow {
  'SIGN ACCT': string;
  'COMPANY NAME': string;
  'SITE NAME': string;
  'Address Line 1': string;
  'Province': string;
  'City': string;
  'Postal Code': string;
  'SERVICE ID': string;
  'Billing Effective Date': string;
  'Contract Term': number;
  'Estimated End Date': string;
  'Description': string;
  'Charges': number;
  'Quantity': number;
  'MAL ID': string;
}

const WirelineUpload: React.FC = (): JSX.Element => {
  const [data, setData] = useState<WirelineRow[]>([]);
  const [status, setStatus] = useState<string>('');

  const excelDateToYYYYMMDD = (excelDate: number): string => {
    try {
      if (!excelDate) return '1900-01-01';
      
      // Excel dates are number of days since 1899-12-30
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return '1900-01-01';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error converting date:', error);
      return '1900-01-01';
    }
  };

  const transformExcelData = (rawData: any[]): WirelineRow[] => {
    return rawData.map(row => ({
      'SIGN ACCT': String(row['SIGN ACCT'] || ''),
      'COMPANY NAME': String(row['COMPANY NAME'] || ''),
      'SITE NAME': String(row['SITE NAME'] || ''),
      'Address Line 1': String(row['Address Line 1'] || ''),
      'Province': String(row['Province'] || ''),
      'City': String(row['City'] || ''),
      'Postal Code': String(row['Postal Code'] || ''),
      'SERVICE ID': String(row['SERVICE ID'] || ''),
      'Billing Effective Date': excelDateToYYYYMMDD(Number(row['Billing Effective Date'])),
      'Contract Term': Number(row['Contract Term'] || 0),
      'Estimated End Date': excelDateToYYYYMMDD(Number(row['Estimated End Date'])),
      'Description': String(row['Description'] || ''),
      'Charges': Number(row['Charges'] || 0),
      'Quantity': Number(row['Quantity'] || 0),
      'MAL ID': String(row['MAL ID'] || '')
    }));
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
            const transformedData = transformExcelData(rawJson);
            console.log('Raw data sample:', rawJson[0]);
            console.log('Transformed data sample:', transformedData[0]);
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

  const triggerFlow = async () => {
    if (data.length === 0) {
      message.error('No data to send.');
      return;
    }

    try {
      const response = await fetch('https://prod-07.canadacentral.logic.azure.com:443/workflows/31e43d72fbd1412f8132e1de5f504baa/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nljKdESTJivI1y_6AiqVBw_xNORtD_0bWxr50e0tHo8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (response.ok) {
        message.success('Flow triggered successfully');
        setStatus('Flow triggered successfully.');
      } else {
        const errorMsg = `Failed to trigger flow. Status: ${response.status}. Response: ${responseText}`;
        console.error(errorMsg);
        message.error(errorMsg);
        setStatus(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error:', errorMessage);
      message.error(`Error: ${errorMessage}`);
      setStatus(`Error: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Wireline Upload</h1>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
          style={{ marginRight: '16px' }}
        />
        <Button 
          type="primary" 
          onClick={triggerFlow}
          icon={<UploadOutlined />}
          disabled={data.length === 0}
        >
          Trigger Flow
        </Button>
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
          Total Records: {data.length}
        </div>
      )}
      {status && (
        <p style={{ 
          padding: '8px', 
          background: '#f0f0f0', 
          borderRadius: '4px', 
          marginTop: '16px' 
        }}>
          {status}
        </p>
      )}
      {data.length > 0 && (
        <div>
          <h3>Parsed Data:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WirelineUpload;
