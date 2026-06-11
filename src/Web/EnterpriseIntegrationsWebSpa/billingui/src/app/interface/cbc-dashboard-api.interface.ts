export interface Country {
  code: number;
  name: string;
  erpCode: string;
}

export interface Vendor {
  vendorKey: number;
  vendorName: string;
}

export interface InvoiceListRequestPayload {
  startDate: string;
  endDate: string;
  includeRetries: boolean;
  offset: number;
  maxResult: number;
  filter: string;
  issueOnly: boolean;
  sortBy: number;
  sortOrder: string;
  searchText: string;
  vendorNames: string;
  countryNames: string;
  partialApprovalFlag: number;
}

export interface OrderResponse {
  approvalDate: string;
  approved: boolean;
  actionable: boolean;
  currency: string;
  declined: boolean;
  endUserCompanyName: string;
  erpInvoiceId: string;
  issueCount: number;
  lineCount: number;
  orderBatchId: number | null;
  resellerPO: string | null;
  salesOrderHeaderId: number;
  salesOrderNumber: string;
  statusCode: number;
  totalResellerCost: number;
  totalVendorCost: number;
  vendorName: string | null;
}

export interface InvoiceList {
  invoiceId: number;
  invoiceNumber: number;
  resellerId: string;
  resellerName: string;
  billingStartDate: string;
  billingEndDate: string;
  country: string;
  countryCode: string;
  erpName: string;
  consolidation: string;
  isOneTime: boolean;
  orderDate: string;
  totalCount: number;
  orders: OrderResponse[];
}