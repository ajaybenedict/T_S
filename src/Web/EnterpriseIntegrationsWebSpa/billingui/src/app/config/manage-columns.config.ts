import { TabButton } from "../interface/button.interface";
import { ColumnConfig } from "../interface/manage-column.interface";

export const TABS: TabButton[] = [
  {
    displayName: 'Invoice Details',
    type: 'filter',
    selected: true,
    hasCloseBtn: false,
    selectedCount: 0,
    onClickEvent: 'InvoiceDetails',
    closeBtnClickEvent: 'close'
  },
  {
    displayName: 'Order Details',
    type: 'filter',
    selected: false,
    hasCloseBtn: false,
    selectedCount: 0,
    onClickEvent: 'OrderDetails',
    closeBtnClickEvent: 'close'
  }
];


export const COLUMNS: ColumnConfig[] = [
  { tabname: 'Invoice Details', displayName: 'Invoice ID', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'IssueCount', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'OrderCount', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'Order Details', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'Total RP', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Total VC', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'End User', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Fx', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Reseller Details', visible: true, groupname: 'Invoice Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Cs', visible: true, groupname: 'Invoice Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Country', visible: true, groupname: 'Invoice Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Action', visible: true, groupname: 'Invoice Information', isfreezedColumn: true },

  { tabname: 'Order Details', displayName: 'LN', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'TD SKU', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'Fx', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'Qty', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'VND Unit', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'VND Total', visible: true, isfreezedColumn: false }
];


export const ACTIONEDCOLUMNS: ColumnConfig[] = [
  { tabname: 'Invoice Details', displayName: 'Invoice ID', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'IssueCount', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'OrderCount', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'Order Details', visible: true, isfreezedColumn: true },
  { tabname: 'Invoice Details', displayName: 'Total RP', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Total VC', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'End User', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Fx', visible: true, groupname: 'Order Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Reseller Details', visible: true, groupname: 'Invoice Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Cs', visible: true, groupname: 'Invoice Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Country', visible: true, groupname: 'Invoice Information', isfreezedColumn: false },
  { tabname: 'Invoice Details', displayName: 'Status', visible: true, groupname: 'Invoice Information', isfreezedColumn: true },

  { tabname: 'Order Details', displayName: 'LN', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'TD SKU', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'Fx', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'Qty', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'VND Unit', visible: true, isfreezedColumn: false },
  { tabname: 'Order Details', displayName: 'VND Total', visible: true, isfreezedColumn: false }
];


export const DOWNLOAD_TABS: TabButton[] = [
  {
    displayName: 'All',
    type: 'filter',
    selected: true,
    hasCloseBtn: false,
    selectedCount: 0,
    onClickEvent: 'allCharges',
    closeBtnClickEvent: 'close'
  },
  {
    displayName: 'Negative Charges',
    type: 'filter',
    selected: false,
    hasCloseBtn: false,
    selectedCount: 0,
    onClickEvent: 'negativeCharges',
    closeBtnClickEvent: 'close'
  }
];
