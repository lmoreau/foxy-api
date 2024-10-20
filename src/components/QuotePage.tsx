import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'antd';
import axios from 'axios';

interface QuoteLocation {
  foxy_foxyquoterequestlocationid: string;
  foxy_locationid: string;
  createdon: string;
  modifiedon: string;
  statuscode: number;
  fullAddress: string;
}

const QuotePage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<QuoteLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching data for quote ID: ${id}`);
        const response = await axios.get(`http://localhost:7071/api/listQuoteLocationRows?id=${id}`);
        console.log('API response:', JSON.stringify(response.data, null, 2));
        setData(response.data.value || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (axios.isAxiosError(error)) {
          setError(`Error: ${error.response?.data?.message || error.message}`);
        } else {
          setError('An unknown error occurred');
        }
        setData([]);
      }
    };

    if (id && /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(id)) {
      fetchData();
    } else {
      setError('Invalid quote ID. Please provide a valid GUID.');
    }
  }, [id]);

  const columns = [
    {
      title: 'Location ID',
      dataIndex: 'foxy_locationid',
      key: 'foxy_locationid',
    },
    {
      title: 'Full Address',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
    },
    {
      title: 'Created On',
      dataIndex: 'createdon',
      key: 'createdon',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Modified On',
      dataIndex: 'modifiedon',
      key: 'modifiedon',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'statuscode',
      key: 'statuscode',
      render: (code: number) => code === 1 ? 'Active' : 'Inactive',
    },
  ];

  return (
    <div>
      <h1>Quote Locations for Request ID: {id}</h1>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <Table dataSource={data} columns={columns} rowKey="foxy_foxyquoterequestlocationid" />
    </div>
  );
};

export default QuotePage;
