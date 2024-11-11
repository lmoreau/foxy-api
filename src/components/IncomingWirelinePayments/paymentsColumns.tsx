import { ColumnsType } from 'antd/es/table';
import { IncomingWirelinePayment } from '../../types/wirelinePayments';
import { formatCurrency, formatCallidusDate, formatPercentage } from '../../utils/formatters';
import { SortOrder } from 'antd/lib/table/interface';
import { Tag, Tooltip } from 'antd';
import { getColorForService } from '../../utils/constants/relationshipColors';

const CURRENCY_COLUMN_STYLE = { width: 120, minWidth: 120 };
const WIDER_CURRENCY_COLUMN_STYLE = { width: 150, minWidth: 150 };
const SITE_COLUMN_STYLE = { width: 80, minWidth: 80 };

export const paymentsColumns: ColumnsType<IncomingWirelinePayment> = [
  {
    title: 'SFDC Opp',
    dataIndex: 'foxy_opportunitynumber',
    key: 'sfdcOppId',
    sorter: (a, b) => (a.foxy_opportunitynumber || '').localeCompare(b.foxy_opportunitynumber || ''),
    defaultSortOrder: 'ascend' as SortOrder,
    ellipsis: true,
    width: 120,
  },
  {
    title: 'Won Service',
    key: 'serviceId',
    render: (_, record) => {
      const serviceId = record.foxy_WonService?.foxy_serviceid;
      if (!serviceId) return '';
      
      return (
        <Tag color={getColorForService(serviceId)} style={{ margin: 0 }}>
          {serviceId}
        </Tag>
      );
    },
    sorter: (a, b) => (a.foxy_WonService?.foxy_serviceid || '').localeCompare(b.foxy_WonService?.foxy_serviceid || ''),
    ellipsis: true,
    width: 120,
  },
  {
    title: 'TCV',
    dataIndex: 'foxy_netnewtcv',
    key: 'netNewTcv',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_netnewtcv || 0) - (b.foxy_netnewtcv || 0),
    defaultSortOrder: 'ascend' as SortOrder,
    ellipsis: true,
    ...WIDER_CURRENCY_COLUMN_STYLE,
    width: 120,
    onCell: () => ({
      style: { maxWidth: '120px' }
    })
  },
  {
    title: 'Payment ',
    dataIndex: 'foxy_paymentamount',
    key: 'paymentAmount',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_paymentamount || 0) - (b.foxy_paymentamount || 0),
    ellipsis: true,
    ...WIDER_CURRENCY_COLUMN_STYLE,
    width: 120,
    onCell: () => ({
      style: { maxWidth: '120px' }
    })
  },
  {
    title: 'New MRR',
    dataIndex: 'foxy_newmrr',
    key: 'newMrr',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_newmrr || 0) - (b.foxy_newmrr || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
    width: 150,
    onCell: () => ({
      style: { maxWidth: '150px' }
    })
  },
  {
    title: 'Existing MRR',
    dataIndex: 'foxy_existingmrr',
    key: 'existingMrr',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_existingmrr || 0) - (b.foxy_existingmrr || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
    width: 150,
    onCell: () => ({
      style: { maxWidth: '150px' }
    })
  },
  {
    title: 'Company',
    dataIndex: 'foxy_companyname',
    key: 'company',
    sorter: (a, b) => (a.foxy_companyname || '').localeCompare(b.foxy_companyname || ''),
    ellipsis: true,
    width: 250,
    onCell: () => ({
      style: { maxWidth: '250px' }
    })
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'revenueType',
    sorter: (a, b) => (a.foxy_revenuetype || '').localeCompare(b.foxy_revenuetype || ''),
    ellipsis: true,
    width: 130,
    onCell: () => ({
      style: { maxWidth: '130px' }
    })
  },
  {
    title: 'Description',
    dataIndex: 'foxy_productdescription',
    key: 'description',
    ellipsis: {
      showTitle: false
    },
    width: 300,
    render: (description: string, record: IncomingWirelinePayment) => (
      <Tooltip title={`${description} (${record.foxy_productname})`}>
        <span>{description} ({record.foxy_productname})</span>
      </Tooltip>
    ),
    onCell: () => ({
      style: { maxWidth: '300px' }
    })
  },
  {
    title: 'Site',
    dataIndex: 'foxy_opticsite',
    key: 'site',
    ellipsis: true,
    ...SITE_COLUMN_STYLE,
    width: 250,
    onCell: () => ({
      style: { maxWidth: '250px' }
    })
  },
  {
    title: 'Qty',
    dataIndex: 'crc9f_units',
    key: 'units',
    ellipsis: true,
    width: 50,
    onCell: () => ({
      style: { maxWidth: '100px' }
    })
  },
  {
    title: 'Term',
    dataIndex: 'foxy_term',
    key: 'term',
    ellipsis: true,
    width: 80,
    onCell: () => ({
      style: { maxWidth: '80px' }
    })
  },
  {
    title: 'Renewal Rate',
    dataIndex: 'foxy_renewalrate',
    key: 'renewalRate',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_renewalrate || 0) - (b.foxy_renewalrate || 0),
    ellipsis: true,
    width: 130,
    onCell: () => ({
      style: { maxWidth: '130px' }
    })
  },
  {
    title: 'New Rate',
    dataIndex: 'foxy_netnewrate',
    key: 'netNewRate',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_netnewrate || 0) - (b.foxy_netnewrate || 0),
    ellipsis: true,
    width: 130,
    onCell: () => ({
      style: { maxWidth: '130px' }
    })
  },
  {
    title: 'Callidus Statement',
    dataIndex: 'crc9f_paydate',
    key: 'payDate',
    render: (date: string) => formatCallidusDate(date),
    sorter: (a: any, b: any) => new Date(a.crc9f_paydate || '').getTime() - new Date(b.crc9f_paydate || '').getTime(),
    ellipsis: true,
    width: 120,
  },
  {
    title: 'COP',
    dataIndex: 'crc9f_ordernumber',
    key: 'orderNumber',
    ellipsis: true,
    width: 120,
  },
  {
    title: 'Compensation Metric',
    dataIndex: 'crc9f_compensationmetric',
    key: 'compensationMetric',
    ellipsis: true,
    width: 150,
    onCell: () => ({
      style: { maxWidth: '150px' }
    })
  },
  {
    title: 'Dispute Number',
    dataIndex: 'crc9f_disputenumber',
    key: 'disputeNumber',
    ellipsis: true,
    width: 130,
    onCell: () => ({
      style: { maxWidth: '130px' }
    })
  },
];
