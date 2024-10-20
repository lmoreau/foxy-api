import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router-dom';
import { Table, message, Row, Col, Typography } from 'antd';
import axios from 'axios';
import QuoteLineItemsTable from './QuoteLineItemsTable';

const { Title, Text } = Typography;

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

interface QuoteRequest {
  foxy_Account: {
    name: string;
  };
  foxy_quoteid: string;
}

interface QuotePageProps {
  setQuoteRequestId: Dispatch<SetStateAction<string | undefined>>;
}

const QuotePage: React.FC<QuotePageProps> = ({ setQuoteRequestId }) => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<QuoteLocation[]>([]);
  const [lineItems, setLineItems] = useState<{ [key: string]: QuoteLineItem[] }>({});
  const [accountName, setAccountName] = useState<string>('');
  const [quoteId, setQuoteId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quoteRequestResponse = await axios.get(`http://localhost:7071/api/getQuoteRequestById?id=${id}`);
        const quoteRequestData = quoteRequestResponse.data.value[0] as QuoteRequest;
        setAccountName(quoteRequestData.foxy_Account.name);
        setQuoteId(quoteRequestData.foxy_quoteid);
        setQuoteRequestId(quoteRequestData.foxy_quoteid);

        const locationsResponse = await axios.get(`http://localhost:7071/api/listQuoteLocationRows?id=${id}`);
        const locations = locationsResponse.data.value || [];
        setData(locations);
        setError(null);

        setExpandedRowKeys(locations.map((location: QuoteLocation) => location.foxy_foxyquoterequestlocationid));

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
      setQuoteRequestId(undefined);
    }
  }, [id, setQuoteRequestId]);

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
      <Title level={2}>{accountName}</Title>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Text strong>Owner:</Text> Bob Smith
        </Col>
        <Col span={6}>
          <Text strong>Quote Request:</Text> {quoteId}
        </Col>
        <Col span={6}>
          <Text strong>Quote Total MRR:</Text> {formatCurrency(5)}
        </Col>
        <Col span={6}>
          <Text strong>Quote Total TCV:</Text> {formatCurrency(5)}
        </Col>
      </Row>
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
            <QuoteLineItemsTable initialLineItems={lineItems[record.foxy_foxyquoterequestlocationid] || []} />
          ),
          rowExpandable: (record) => lineItems[record.foxy_foxyquoterequestlocationid]?.length > 0,
        }}
        showHeader={false}
        size="small"
        style={{ marginTop: '1rem' }}
      />
    </div>
  );
};

export default QuotePage;
