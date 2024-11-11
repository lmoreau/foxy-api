import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { message, Select, Input, Button, Alert, Typography, Tabs, DatePicker } from 'antd';

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

const RawExcelUpload: React.FC = (): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [payDate, setPayDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  const adjustDateForTimezone = (dateStr: string): string => {
    // Create date object for the next day to account for UTC interpretation
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
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
      'DISCOUNT PERCENT',
      'Subtotal',
      'Activity Code Desc'
    ];

    const filteredRow = { ...row };
    fieldsToRemove.forEach(field => {
      delete filteredRow[field];
    });

    // Add Callidus Statement field with timezone adjustment
    const monthIndex = months.indexOf(selectedMonth) + 1;
    const monthStr = monthIndex.toString().padStart(2, '0');
    const callidusDate = `${selectedYear}-${monthStr}-01`;
    filteredRow['Callidus Statement'] = adjustDateForTimezone(callidusDate);

    // Add Pay Date field with timezone adjustment
    if (payDate) {
      filteredRow['Pay Date'] = adjustDateForTimezone(payDate);
    }

    return filteredRow;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      message.success('File selected successfully');
    }
  };

  const handleParse = () => {
    if (!file) {
      message.error('Please select a file first');
      return;
    }
    if (!selectedMonth || !selectedYear) {
      message.error('Please select both month and year');
      return;
    }
    if (!/^\d{4}$/.test(selectedYear)) {
      message.error('Please enter a valid 4-digit year');
      return;
    }

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
          setPayDate(null); // Reset pay date when new data is parsed
          message.success(`File parsed successfully with ${transformedData.length} rows`);
        } catch (error) {
          console.error('Error parsing Excel:', error);
          message.error('Failed to parse Excel file');
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePayDateChange = (date: any) => {
    if (date) {
      setPayDate(date.format('YYYY-MM-DD'));
    } else {
      setPayDate(null);
    }
  };

  const handleDownloadExcel = () => {
    const groupedData = getGroupedData();
    if (!groupedData?.OPTIC || groupedData.OPTIC.length === 0) {
      message.error('No OPTIC data to download.');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(groupedData.OPTIC);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'OPTIC Data');
      
      // Generate filename with date
      const monthStr = (months.indexOf(selectedMonth) + 1).toString().padStart(2, '0');
      const filename = `OPTIC_Data_${selectedYear}-${monthStr}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      message.error('Failed to download Excel file');
    }
  };

  const triggerFlow = async () => {
    const groupedData = getGroupedData();
    if (!groupedData?.OPTIC || groupedData.OPTIC.length === 0) {
      message.error('No OPTIC data to send.');
      return;
    }

    if (!payDate) {
      message.error('Please select a pay date first.');
      return;
    }

    try {
      const response = await fetch('https://prod-09.canadacentral.logic.azure.com:443/workflows/329726db42d7496ba974701e5976dec6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2ucnXnDLQQW2Qy6SbJSRBU7piD0ph_e5to9Cjv7jyE8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupedData.OPTIC)
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
      <Alert
        message={
          <span>
            Please upload the <Text strong>A02v2_CommissionDetail_v2_EN</Text> report from Callidus, in <Text strong>XLSX</Text> format. Select the date that matches the report date, not the published date.
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      <h1>Raw Excel Upload</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileSelect}
          style={{ marginRight: '16px' }}
        />
        <Select
          placeholder="Select month"
          style={{ width: 120 }}
          onChange={(value) => setSelectedMonth(value)}
          value={selectedMonth || undefined}
        >
          {months.map(month => (
            <Option key={month} value={month}>{month}</Option>
          ))}
        </Select>
        <Input
          placeholder="Enter year (YYYY)"
          style={{ width: 120 }}
          onChange={(e) => setSelectedYear(e.target.value)}
          value={selectedYear}
        />
        <Button 
          type="primary"
          onClick={handleParse}
          disabled={!file || !selectedMonth || !selectedYear}
        >
          Parse File
        </Button>
      </div>
      {data.length > 0 && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <DatePicker
              onChange={handlePayDateChange}
              placeholder="Select Pay Date"
              style={{ width: 200 }}
            />
            {payDate && (
              <>
                <Button 
                  type="primary"
                  onClick={triggerFlow}
                  disabled={!groupedData?.OPTIC || groupedData.OPTIC.length === 0}
                >
                  Run Flow
                </Button>
                <Button
                  onClick={handleDownloadExcel}
                  disabled={!groupedData?.OPTIC || groupedData.OPTIC.length === 0}
                >
                  Download Excel
                </Button>
              </>
            )}
          </div>
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
        </>
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
      {groupedData && (
        <div>
          <h3>Parsed Data:</h3>
          <Tabs defaultActiveKey="OPTIC">
            <TabPane tab={`OPTIC (${groupedData.OPTIC.length})`} key="OPTIC">
              <textarea
                value={JSON.stringify(groupedData.OPTIC, null, 2)}
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
            </TabPane>
            <TabPane tab={`Other (${groupedData.Other.length})`} key="Other">
              <textarea
                value={JSON.stringify(groupedData.Other, null, 2)}
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
            </TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default RawExcelUpload;
