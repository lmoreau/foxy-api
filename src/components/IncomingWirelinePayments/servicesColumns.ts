import { ColumnsType } from 'antd/es/table';
import { WonService } from '../../types/wonServices';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { revenueTypeMapper } from '../../utils/constants/revenueTypeMapper';
import { inPaymentStatusMapper } from '../../utils/constants/inPaymentStatusMapper';

const CURRENCY_COLUMN_STYLE = { width: 120, minWidth: 120 };

export const servicesColumns: ColumnsType<WonService> = [
  {
    title: 'SFDC Opp',
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
    width: 130,
    onCell: () => ({
      style: { maxWidth: '130px' }
    })
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
    width: 100,
    onCell: () => ({
      style: { maxWidth: '100px' }
    })
  },
  {
    title: 'Solo',
    dataIndex: 'foxy_sololine',
    key: 'soLine',
    ellipsis: true,
    width: 50,
    onCell: () => ({
      style: { maxWidth: '50px' }
    })
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'revenueType',
    render: (value: number) => revenueTypeMapper[value] || value,
    ellipsis: true,
    width: 120,
    onCell: () => ({
      style: { maxWidth: '120px' }
    })
  },
  {
    title: 'Margin',
    dataIndex: 'foxy_linemargin',
    key: 'lineMargin',
    render: (value: number) => formatPercentage(value),
    sorter: (a, b) => (a.foxy_linemargin || 0) - (b.foxy_linemargin || 0),
    ellipsis: true,
    width: 100,
    onCell: () => ({
      style: { maxWidth: '100px' }
    })
  },
  {
    title: 'Term',
    dataIndex: 'foxy_term',
    key: 'term',
    ellipsis: true,
    width: 70,
    onCell: () => ({
      style: { maxWidth: '70px' }
    })
  },
  {
    title: 'Payment Status',
    dataIndex: 'foxy_inpaymentstatus',
    key: 'inPaymentStatus',
    render: (value: number) => inPaymentStatusMapper[value] || value,
    ellipsis: true,
    width: 140,
    onCell: () => ({
      style: { maxWidth: '140px' }
    })
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
    width: 150,
    onCell: () => ({
      style: { maxWidth: '150px' }
    })
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
