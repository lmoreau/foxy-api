import { ColumnsType } from 'antd/es/table';
import { IncomingWirelinePayment } from '../../types/wirelinePayments';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';
import { SortOrder } from 'antd/lib/table/interface';

const CURRENCY_COLUMN_STYLE = { width: 120, minWidth: 120 };
const SITE_COLUMN_STYLE = { width: 100, minWidth: 100 };

export const paymentsColumns: ColumnsType<IncomingWirelinePayment> = [
  {
    title: 'SFDC Opp ID',
    dataIndex: 'foxy_opportunitynumber',
    key: 'sfdcOppId',
    sorter: (a, b) => (a.foxy_opportunitynumber || '').localeCompare(b.foxy_opportunitynumber || ''),
    defaultSortOrder: 'ascend' as SortOrder,
    ellipsis: true,
  },
  {
    title: 'Net New TCV',
    dataIndex: 'foxy_netnewtcv',
    key: 'netNewTcv',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_netnewtcv || 0) - (b.foxy_netnewtcv || 0),
    defaultSortOrder: 'ascend' as SortOrder,
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Payment Amount',
    dataIndex: 'foxy_paymentamount',
    key: 'paymentAmount',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_paymentamount || 0) - (b.foxy_paymentamount || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Company',
    dataIndex: 'foxy_companyname',
    key: 'company',
    sorter: (a, b) => (a.foxy_companyname || '').localeCompare(b.foxy_companyname || ''),
    ellipsis: true,
  },
  {
    title: 'Product',
    dataIndex: 'foxy_productname',
    key: 'product',
    sorter: (a, b) => (a.foxy_productname || '').localeCompare(b.foxy_productname || ''),
    ellipsis: true,
  },
  {
    title: 'Description',
    dataIndex: 'foxy_productdescription',
    key: 'description',
    ellipsis: true,
  },
  {
    title: 'Site',
    dataIndex: 'foxy_opticsite',
    key: 'site',
    ellipsis: true,
    ...SITE_COLUMN_STYLE,
  },
  {
    title: 'Payment Date',
    dataIndex: 'foxy_paymentdate',
    key: 'paymentDate',
    render: (date: string) => formatDate(date),
    sorter: (a, b) => new Date(a.foxy_paymentdate).getTime() - new Date(b.foxy_paymentdate).getTime(),
    ellipsis: true,
  },
  {
    title: 'Existing MRR',
    dataIndex: 'foxy_existingmrr',
    key: 'existingMrr',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_existingmrr || 0) - (b.foxy_existingmrr || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'New MRR',
    dataIndex: 'foxy_newmrr',
    key: 'newMrr',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_newmrr || 0) - (b.foxy_newmrr || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'revenueType',
    sorter: (a, b) => (a.foxy_revenuetype || '').localeCompare(b.foxy_revenuetype || ''),
    ellipsis: true,
  },
  {
    title: 'Term',
    dataIndex: 'foxy_term',
    key: 'term',
    ellipsis: true,
  },
  {
    title: 'Margin',
    dataIndex: 'foxy_margin',
    key: 'margin',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_margin || 0) - (b.foxy_margin || 0),
    ellipsis: true,
  },
  {
    title: 'Renewal Rate',
    dataIndex: 'foxy_renewalrate',
    key: 'renewalRate',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_renewalrate || 0) - (b.foxy_renewalrate || 0),
    ellipsis: true,
  },
  {
    title: 'Net New Rate',
    dataIndex: 'foxy_netnewrate',
    key: 'netNewRate',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_netnewrate || 0) - (b.foxy_netnewrate || 0),
    ellipsis: true,
  },
  {
    title: 'Order Number',
    dataIndex: 'crc9f_ordernumber',
    key: 'orderNumber',
    ellipsis: true,
  },
];
