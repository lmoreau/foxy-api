import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ResidualUpload: React.FC = () => {
  const [data, setData] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        if (typeof bstr === 'string') {
          const workbook = XLSX.read(bstr, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet);
          setData(json);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div>
      <h1>Residual Upload</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};

export default ResidualUpload;
