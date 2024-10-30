import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ResidualRow {
  Period: string;
  Duns: string;
  BAN: string;
  'Subscriber Last Name': string;
  'Customer Segmentation': string;
  'Product Desc': string;
  'Billed Revenue': number;
  'Billed Month/Year': string;
}

const ResidualUpload: React.FC = (): JSX.Element => {
  const [data, setData] = useState<ResidualRow[]>([]);
  const [status, setStatus] = useState<string>('');

  const transformExcelData = (rawData: any[]): ResidualRow[] => {
    return rawData.map(row => ({
      Period: String(row['Period'] || ''),
      Duns: String(row['Duns'] || ''),
      BAN: String(row['BAN'] || ''),
      'Subscriber Last Name': String(row['Subscriber Last Name'] || ''),
      'Customer Segmentation': String(row['Customer Segmentation'] || ''),
      'Product Desc': String(row['Product Desc'] || ''),
      'Billed Revenue': Number(row['Billed Revenue'] || 0),
      'Billed Month/Year': String(row['Billed Month/Year'] || '')
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
            setData(transformedData);
            message.success('File uploaded successfully');
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
      const response = await fetch('https://prod-23.canadacentral.logic.azure.com:443/workflows/00a158236115474eb218b3bd6c3e1397/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ow9L9uDn5QmWHM3dSMX4Pkuu8dl6Qxtwm0LFgHfw7as', {
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
      <h1>Residual Upload</h1>
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
          <h3>Parsed Data ({data.length} rows):</h3>
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

export default ResidualUpload;
