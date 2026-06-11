import { GroupedTableColumns, FlattenedTableColumns } from "../interface/data-table-columns.interface";

export const ORDER_LEVEL_TABLE_COLUMNS: FlattenedTableColumns[] = [
  {
    columnName: 'LN', key: 'lineNumber', templateId: 'countryformat',  valueGetter: (rowData) => [rowData.lineNumber],
  },
  {
    columnName: 'TD SKU', key: 'techDataSKU', templateId: 'greyTextFormat', valueGetter: (rowData) => [rowData.techDataSKU]
  },
  {
    columnName: 'Fx', key: 'purchaseCurrency', templateId: 'countryformat', valueGetter: (rowData) => [rowData.purchaseCurrency]
  },
  {
    columnName: 'Qty', key: 'quantity', templateId: 'countryformat', valueGetter: (rowData) => [rowData.quantity]
  },
  {
    columnName: 'VND Unit', key: 'cost', templateId: 'greyTextFormat', valueGetter: (rowData) => [rowData.cost]
  },
  {
    columnName: 'VND Total', key: 'cost', templateId: 'greyTextFormat' , valueGetter: (rowData) => [rowData.cost]
  },
  {
    columnName: 'RES Unit', key: 'price', templateId: 'greyTextFormat' , valueGetter: (rowData) => [rowData.prize]
  },
  {
    columnName: 'RES Total', key: 'price', templateId: 'greyTextFormat'  , valueGetter: (rowData) => [rowData.prize]   
  },
  {
    columnName: 'End User', key: 'endUserCompanyName', templateId: 'greyTextFormat' , valueGetter: (rowData) => [rowData.endUserCompanyName]
  },
  {
    columnName: 'Subscription', key: 'subscriptionId', templateId: 'greyTextFormat', valueGetter: (rowData) => [rowData.subscriptionId]
  },

];



export const ORDER_SECOND_LEVEL_TABLE_COLUMNS: FlattenedTableColumns[] = [
  {
    columnName: 'Product Info', key: 'description', className: 'linelevelrow',
  },
  {
    columnName: 'Product ID', key: 'vendorProductId', className: 'linelevelrow',
  },
  {
    columnName: 'Collection SKU', key: 'skuDataSource', className: 'linelevelrow',
  },
  {
    columnName: 'Cost', key: 'cost', className: 'linelevelrow',
  },
  {
    columnName: 'Price', key: 'price', className: 'linelevelrow',
  },
  {
    columnName: 'SKU Data', key: 'techDataSKU', className: 'linelevelrow',
  }
];

const COMMON_BILLING_COLUMNS: GroupedTableColumns[] = [
  {
    columnName: 'Invoice ID',
    key: 'invoiceId',
    groupHeaderPosition: 'left',
    isCheckbox: true,
    isGroupKey: true,
    isFrozen: true,
    showInGroupHeader: true,
    className: 'invoicetbl',
    valueGetter: (rowData, orderData) => [
      rowData.invoiceId,
      rowData.invoiceNumber
    ],
    templateId: 'invoice'
  },
  {
    columnName: 'IssueCount',
    key: 'issueCount',
    className: 'statuscol',
    parentKey: 'salesOrderNumber',
    valueGetter: (_, orderData) => [orderData.issueCount],
    templateId: 'issueCount'
  },
  {
    columnName: 'OrderCount',
    key: 'lineCount',
    className: 'ordercountcol',
    parentKey: 'salesOrderNumber',
    valueGetter: (_, orderData) => [orderData.lineCount],
    templateId: 'greyTextFormat'
  },
  {
    columnName: 'Order Details',
    key: 'salesOrderNumber',
    isGroupColumn: true,
    className: 'orderdtl',
    valueGetter: (rowData, orderData) => [
      orderData.salesOrderHeaderId,
      rowData.orderDate
    ],
    templateId: 'orderDetails'
  },
  {
    columnName: 'Fx',
    key: 'currencyCode',
    className: 'fx',
    valueGetter: (_, orderData) => [orderData.currency],
    templateId: 'countryformat'
  },
  {
    columnName: 'Total RP',
    key: 'totalResellerCost',
    className: 'rp',
    valueGetter: (_, orderData) => [orderData.totalResellerCost],
    templateId: 'greyTextFormat'
  },
  {
    columnName: 'Total VC',
    key: 'totalVendorCost',
    className: 'vc',
    valueGetter: (_, orderData) => [orderData.totalVendorCost],
    templateId: 'greyTextFormat'
  },
  {
    columnName: 'End User',
    key: 'endUserCompanyName',
    className: 'enduser',
    valueGetter: (_, orderData) => [orderData.endUserCompanyName],
  },
  {
    columnName: 'Reseller Details',
    key: 'resellerName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'resellerdtl',
    valueGetter: (rowData, orderData) => [
      rowData.resellerName,
      rowData.resellerId
    ],
    templateId: 'resellerdetails'
  },
  {
    columnName: 'Cs',
    key: 'consolidation',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'cs',
    valueGetter: (rowData, orderData) => [rowData.consolidation]
  },
  {
    columnName: 'Country',
    key: 'erpName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'country',
    valueGetter: (rowData, orderData) => [rowData.country],
    templateId: 'countryformat'
  }
];

const ACTION_COLUMN: GroupedTableColumns = {
  columnName: 'Actions',
  key: 'actions',
  groupHeaderPosition: 'right',
  showInGroupHeader: true,
  className: 'action',
  actionKeys: ['Approve', 'Decline'],
  actionsIsDropdown: true,
  isStatus: false
};

const STATUS_COLUMN: GroupedTableColumns = {
  columnName: 'Status',
  key: 'statusCode',
  groupHeaderPosition: 'right',
  showInGroupHeader: true,
  className: 'action',
  isStatus: true,
  actionsIsDropdown: true,
   valueGetter: (rowData, orderData) => [orderData.statusCode],
};

export const BILLING_COLUMNS: GroupedTableColumns[] = [
  ...COMMON_BILLING_COLUMNS,
  ACTION_COLUMN
];

export const BILLING_ACTIONED_COLUMNS: GroupedTableColumns[] = [
  ...COMMON_BILLING_COLUMNS,
  STATUS_COLUMN
];