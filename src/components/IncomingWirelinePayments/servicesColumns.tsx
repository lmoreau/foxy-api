import { ColumnsType } from 'antd/es/table';
import { Tag, Tooltip } from 'antd';
import { WonService } from '../../types/wonServices';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { revenueTypeMapper } from '../../utils/constants/revenueTypeMapper';
import { inPaymentStatusMapper } from '../../utils/constants/inPaymentStatusMapper';
import { getColorForService } from '../../utils/constants/relationshipColors';

const CURRENCY_COLUMN_STYLE = { width: 120, minWidth: 120 };

export const servicesColumns: ColumnsType<WonService> = [
  {
    title: 'Service ID',
    dataIndex: 'foxy_serviceid',
    key: 'serviceId',
    ellipsis: true,
    width: 120,
    render: (serviceId: string) => (
      <Tag color={getColorForService(serviceId)} style={{ margin: 0 }}>
        {serviceId}
      </Tag>
    ),
    onCell: () => ({
      style: { maxWidth: '120px' }
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
    title: 'TCV',
    dataIndex: 'foxy_tcv',
    key: 'tcv',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_tcv || 0) - (b.foxy_tcv || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
  },
  {
    title: 'Expected Comp',
    dataIndex: 'foxy_expectedcomp',
    key: 'expectedComp',
    render: (amount: number, record: WonService) => (
      <Tooltip title={record.crc9f_expectedcompbreakdown}>
        {formatCurrency(amount)}
      </Tooltip>
    ),
    sorter: (a, b) => (a.foxy_expectedcomp || 0) - (b.foxy_expectedcomp || 0),
    ellipsis: true,
    ...CURRENCY_COLUMN_STYLE,
    width: 150,
    onCell: () => ({
      style: { maxWidth: '150px' }
    })
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
    title: 'Product',
    dataIndex: ['foxy_Product', 'name'],
    key: 'product',
    ellipsis: true,
  },
  {
    title: 'Site',
    dataIndex: ['foxy_AccountLocation', 'foxy_Building', 'foxy_fulladdress'],
    key: 'accountLocation',
    ellipsis: true,
    width: 250,
    onCell: () => ({
      style: { maxWidth: '250px' }
    })
  },
  {
    title: 'Quantity',
    dataIndex: 'foxy_quantity',
    key: 'quantity',
    ellipsis: true,
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'revenueType',
    render: (value: number, record: WonService) => (
      <Tooltip title={record.foxy_renewaltype}>
        {revenueTypeMapper[value] || value}
      </Tooltip>
    ),
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
    title: 'MRR Uptick',
    dataIndex: 'foxy_mrruptick',
    key: 'mrrUptick',
    render: (amount: number) => formatCurrency(amount),
    sorter: (a, b) => (a.foxy_mrruptick || 0) - (b.foxy_mrruptick || 0),
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
];
