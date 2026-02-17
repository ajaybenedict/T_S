import { TableColumn, GroupedTableColumns } from "../interface/data-table-columns.interface";

export const ORDER_LEVEL_TABLE_COLUMNS: TableColumn[] = [
  {
    columnName: 'LN', key: 'lineNumber', className: 'linelevelrow',
  },
  {
    columnName: 'TD SKU', key: 'techDataSKU', className: 'linelevelrow',
  },
  {
    columnName: 'Fx', key: 'purchaseCurrency', className: 'linelevelrow',
  },
  {
    columnName: 'Qty', key: 'quantity', className: 'linelevelrow',
  },
  {
    columnName: 'VND Unit', key: 'cost', className: 'linelevelrow',
  },
  {
    columnName: 'VND Total', key: 'cost', className: 'linelevelrow',
  },
  {
    columnName: 'RES Unit', key: 'prize', className: 'linelevelrow',
  },
  {
    columnName: 'RES Total', key: 'prize', className: 'linelevelrow',
  },
  {
    columnName: 'End User', key: 'endUserCompanyName', className: 'linelevelrow',
  },

];



export const ORDER_SECOND_LEVEL_TABLE_COLUMNS: TableColumn[] = [
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

export const BILLING_COLUMNS: GroupedTableColumns[] = [
  {
    columnName: 'Invoice ID',
    key: 'invoiceId',
    groupHeaderPosition: 'left',
    isCheckbox:true,
    isFrozen: true,
    showInGroupHeader: true,
    pipe: 'InvoiceIDFormat',
    pipeArgs: ['invoiceNumber'],
    className: 'invoicetbl',
    valueGetter: (rowData, _) => rowData.invoiceId,
  },
  {
    columnName: 'IssueCount',
    key: 'issueCount',
    className: 'statuscol',
    parentKey:'salesOrderNumber',
    pipe: 'IssueCountFormat',
    valueGetter: (_, orderData) => orderData.issueCount,
  },
  {
    columnName: 'OrderCount',
    key: 'lineCount',
    className: 'ordercountcol',
    parentKey:'salesOrderNumber',
    pipe: 'PriceFormat',
    valueGetter: (_, orderData) => orderData.lineCount,
  },
  {
    columnName: 'Order Details',
    key: 'salesOrderNumber',  
    isGroupColumn: true,      
    className: 'orderdtl',
    pipe: 'orderDetailsFormat',
    pipeArgs: ['orderDate'],
    valueGetter: (_, orderData) => orderData.salesOrderNumber,
  },
 
  {
    columnName: 'Total RP',
    key: 'totalResellerCost',
    pipe: 'PriceFormat',
    className: 'rp',
    valueGetter: (_, orderData) => orderData.totalResellerCost,
  },
  {
    columnName: 'Total VC',
    key: 'totalVendorCost',
    pipe: 'PriceFormat',
    className: 'vc',
    valueGetter: (_, orderData) => orderData.totalVendorCost,
  },
  {
    columnName: 'End User',
    key: 'endUserCompanyName',
    className: 'enduser',
    valueGetter: (_, orderData) => orderData.endUserCompanyName,
  },
   {
    columnName: 'Fx',
    key: 'currencyCode',
    pipe: 'CountryFormat',
    className: 'fx',
    valueGetter: (_, orderData) => orderData.currencyCode,
  },
  {
    columnName: 'Reseller Details',
    key: 'resellerName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    pipe: 'ResellerDetailFormat',
    pipeArgs: ['resellerId'],
    className: 'resellerdtl',
    valueGetter: (_, orderData) => orderData.resellerName,
  },
  {
    columnName: 'Cs',    
    key: 'consolidation',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'cs',
    valueGetter: (_, orderData) => orderData.consolidation
  },
  {
    columnName: 'Country',
    key: 'erpName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    pipe: 'CountryFormat',
    className: 'country',
    valueGetter: (_, orderData) => orderData.erpName
  },
  {
    columnName: 'Action',
    key: 'erpName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'action',
    actionKeys: ['Approve', 'Decline'],
    actionsIsDropdown: true, 
    isStatus: false,
    valueGetter: (_, orderData) => orderData.erpName

  }
];

export const BILLING_ACTIONED_COLUMNS: GroupedTableColumns[] = [
  {
    columnName: 'Invoice ID',
    key: 'invoiceId',
    groupHeaderPosition: 'left',
    isCheckbox:true,
    isFrozen: true,
    showInGroupHeader: true,
    pipe: 'InvoiceIDFormat',
    pipeArgs: ['invoiceNumber'],
    className: 'invoicetbl',
    valueGetter: (rowData, _) => rowData.invoiceId,
  },
  {
    columnName: 'IssueCount',
    key: 'issueCount',
    className: 'statuscol',
    parentKey:'salesOrderNumber',
    pipe: 'IssueCountFormat',
    valueGetter: (_, orderData) => orderData.issueCount,
  },
  {
    columnName: 'OrderCount',
    key: 'lineCount',
    className: 'ordercountcol',
    parentKey:'salesOrderNumber',
    pipe: 'PriceFormat',
    valueGetter: (_, orderData) => orderData.lineCount,
  },
  {
    columnName: 'Order Details',
    key: 'salesOrderNumber',  
    isGroupColumn: true,      
    className: 'orderdtl',
    pipe: 'orderDetailsFormat',
    pipeArgs: ['orderDate'],
    valueGetter: (_, orderData) => orderData.salesOrderNumber,
  },
  {
    columnName: 'Fx',
    key: 'currencyCode',
    pipe: 'CountryFormat',
    className: 'fx',
    valueGetter: (_, orderData) => orderData.currencyCode,
  },
  {
    columnName: 'Total RP',
    key: 'totalResellerCost',
    pipe: 'PriceFormat',
    className: 'rp',
    valueGetter: (_, orderData) => orderData.totalResellerCost,
  },
  {
    columnName: 'Total VC',
    key: 'totalVendorCost',
    pipe: 'PriceFormat',
    className: 'vc',
    valueGetter: (_, orderData) => orderData.totalVendorCost,
  },
  {
    columnName: 'End User',
    key: 'endUserCompanyName',
    className: 'enduser',
    valueGetter: (_, orderData) => orderData.endUserCompanyName,
  },
  {
    columnName: 'Reseller Details',
    key: 'resellerName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    pipe: 'ResellerDetailFormat',
    pipeArgs: ['resellerId'],
    className: 'resellerdtl',
    valueGetter: (_, orderData) => orderData.resellerName,
  },
  {
    columnName: 'Cs',    
    key: 'consolidation',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'cs',
    valueGetter: (_, orderData) => orderData.consolidation
  },
  {
    columnName: 'Country',
    key: 'erpName',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    pipe: 'CountryFormat',
    className: 'country',
    valueGetter: (_, orderData) => orderData.erpName
  },
  {
    columnName: 'Status',
    key: 'status',
    groupHeaderPosition: 'right',
    showInGroupHeader: true,
    className: 'action', 
    isStatus: true,
    actionsIsDropdown: true

  }
];
