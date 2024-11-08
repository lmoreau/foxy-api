import { ColumnsType } from 'antd/es/table';
import { WonService } from '../../types/wonServices';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { revenueTypeMapper } from '../../utils/constants/revenueTypeMapper';
import { inPaymentStatusMapper } from '../../utils/constants/inPaymentStatusMapper';

const CURRENCY_COLUMN_STYLE = { width: 120, minWidth: 120 };

export const servicesColumns: ColumnsType<WonService> = [
  {
    title: 'SFDC Opp ID',
    dataIndex: ['foxy_Opportunity', 'foxy_sfdcoppid'],
    key: 'sfdcOppId',
    sorter: (a, b) => ((a.foxy_Opportunity?.foxy_sfdcoppid || '') as string).localeCompare((b.foxy_Opportunity?.foxy_sfdcoppid || '') as string),
    ellipsis: true,
  },
  {
    title: 'TCV',
    dataIndex: 'foxy_tcv',
    key: 'tcv',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_tcv || 0) - (b.foxy_tcv || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Existing MRR',
    dataIndex: 'crc9f_existingmrr',
    key: 'existingMrr',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.crc9f_existingmrr || 0) - (b.crc9f_existingmrr || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Renewal Disposition',
    dataIndex: 'foxy_renewaldisposition',
    key: 'renewalDisposition',
    ellipsis: true,
  },
  {
    title: 'Status Code',
    dataIndex: 'statuscode',
    key: 'statusCode',
    ellipsis: true,
  },
  {
    title: 'Infusion Payment Status',
    dataIndex: 'foxy_infusionpaymentstatus',
    key: 'infusionPaymentStatus',
    ellipsis: true,
  },
  {
    title: 'Renewal Type',
    dataIndex: 'foxy_renewaltype',
    key: 'renewalType',
    ellipsis: true,
  },
  {
    title: 'Quantity',
    dataIndex: 'foxy_quantity',
    key: 'quantity',
    ellipsis: true,
  },
  {
    title: 'MRR',
    dataIndex: 'foxy_mrr',
    key: 'mrr',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_mrr || 0) - (b.foxy_mrr || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Comp Rate',
    dataIndex: 'foxy_comprate',
    key: 'compRate',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_comprate || 0) - (b.foxy_comprate || 0),
    ellipsis: true,
  },
  {
    title: 'SO Line',
    dataIndex: 'foxy_sololine',
    key: 'soLine',
    ellipsis: true,
  },
  {
    title: 'State Code',
    dataIndex: 'statecode',
    key: 'stateCode',
    ellipsis: true,
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'revenueType',
    render: (value: number) => revenueTypeMapper[value] || value,
    ellipsis: true,
  },
  {
    title: 'Line Margin',
    dataIndex: 'foxy_linemargin',
    key: 'lineMargin',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_linemargin || 0) - (b.foxy_linemargin || 0),
    ellipsis: true,
  },
  {
    title: 'Term',
    dataIndex: 'foxy_term',
    key: 'term',
    ellipsis: true,
  },
  {
    title: 'Payment Status',
    dataIndex: 'foxy_inpaymentstatus',
    key: 'inPaymentStatus',
    render: (value: number) => inPaymentStatusMapper[value] || value,
    ellipsis: true,
  },
  {
    title: 'MRR Uptick',
    dataIndex: 'foxy_mrruptick',
    key: 'mrrUptick',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_mrruptick || 0) - (b.foxy_mrruptick || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Expected Comp',
    dataIndex: 'foxy_expectedcomp',
    key: 'expectedComp',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_expectedcomp || 0) - (b.foxy_expectedcomp || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Product',
    dataIndex: ['foxy_Product', 'name'],
    key: 'product',
    ellipsis: true,
  },
  {
    title: 'Account',
    dataIndex: ['foxy_Account', 'name'],
    key: 'account',
    ellipsis: true,
  },
  {
    title: 'Opportunity',
    dataIndex: ['foxy_Opportunity', 'name'],
    key: 'opportunity',
    ellipsis: true,
  },
  {
    title: 'Account Location',
    dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
    key: 'accountLocation',
    ellipsis: true,
  },
];
