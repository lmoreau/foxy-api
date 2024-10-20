import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, message } from 'antd';
import axios from 'axios';
import QuoteLineItemsTable from './QuoteLineItemsTable';

interface QuoteLocation {
  foxy_foxyquoterequestlocationid: string;
  foxy_locationid: string;
  createdon: string;
  modifiedon: string;
  statuscode: number;
  fullAddress: string;
}

interface QuoteLineItem {
  foxy_foxyquoterequestlineitemid: string;
  foxy_quantity: number;
  foxy_each: number;
  foxy_mrr: number;
  foxy_linetcv: number;
  foxy_term: number;
  foxy_revenuetype: number;
  foxy_renewaltype: string;
  foxy_renewaldate: string;
  foxy_Product: {
    name: string;
  };
}

const QuotePage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<QuoteLocation[]>([]);
  const [lineItems, setLineItems] = useState<{ [key: string]: QuoteLineItem[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching data for quote ID: ${id}`);
        const response = await axios.get(`http://localhost:7071/api/listQuoteLocationRows?id=${id}`);
        console.log('API response:', JSON.stringify(response.data, null, 2));
        const locations = response.data.value || [];
        setData(locations);
        setError(null);

        // Set all rows to be expanded by default
        setExpandedRowKeys(locations.map((location: QuoteLocation) => location.foxy_foxyquoterequestlocationid));

        // Fetch line items for each location
        const lineItemsPromises = locations.map(async (location: QuoteLocation) => {
          try {
            const lineItemsResponse = await axios.get(`http://localhost:7071/api/listQuoteLineItemByRow?id=${location.foxy_foxyquoterequestlocationid}`);
            return { [location.foxy_foxyquoterequestlocationid]: lineItemsResponse.data.value };
          } catch (error) {
            console.error(`Error fetching line items for location ${location.foxy_foxyquoterequestlocationid}:`, error);
            message.error(`Failed to load line items for location ${location.foxy_locationid}`);
            return { [location.foxy_foxyquoterequestlocationid]: [] };
          }
        });

        const lineItemsResults = await Promise.all(lineItemsPromises);
        const lineItemsMap = Object.assign({}, ...lineItemsResults);
        setLineItems(lineItemsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (axios.isAxiosError(error)) {
          setError(`Error: ${error.response?.data?.message || error.message}`);
        } else {
          setError('An unknown error occurred');
        }
        setData([]);
        setLineItems({});
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
      title: 'Quote Location',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      render: (text: string) => <strong>{text}</strong>,
    },
  ];

  return (
    <div>
      <h1>Quote Locations for Request ID: {id}</h1>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <Table
        dataSource={data}
        columns={columns}
        rowKey="foxy_foxyquoterequestlocationid"
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (newExpandedRows) => {
            setExpandedRowKeys(newExpandedRows as string[]);
          },
          expandedRowRender: (record) => (
            <QuoteLineItemsTable lineItems={lineItems[record.foxy_foxyquoterequestlocationid] || []} />
          ),
          rowExpandable: (record) => lineItems[record.foxy_foxyquoterequestlocationid]?.length > 0,
        }}
        showHeader={false}
      />
    </div>
  );
};

export default QuotePage;
