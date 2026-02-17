import { CloudTools } from "src/app/core/config/cloud-tools.config";
import { S1DataTableColumn } from "../s1/s1-data-table.interface";
import { S1FilterButtons } from "../s1/s1-filter-buttons.interface";

// panel-models.ts
export type CloudToolsPanelContent = FormTab | TableTab<unknown>;

export interface BaseTab {
  id: string;
  title: string;
  disabled?: boolean;
  hidden?: boolean;
  order?: number;
}

export interface FormTab extends S1FilterButtons {
  tabType: 'form';
  rows: FormRow[];
}

export interface FormRow {
  value: string;
  label: string;
  sortOrder: number;
}

export interface TableTab<T> extends S1FilterButtons {
  tabType: 'table';
  columns: S1DataTableColumn[];
  tableData: T[];
}

export enum CloudToolsSidePanelDetailsTabEnum {
  Details = 'Details'
}

export type CloudToolsSidePanelDetailsTabData = {
    [key in CloudToolsSidePanelDetailsTabEnum]: {
        displayName: string;
        onClickEvent: string;
    };
}
export interface CloudToolsFileUploadResponse {
  transactionId: string;
  status: number;
}

export interface TransactionRequest {
  pageNumber: number;
  pageSize: number;
  searchText: string;
  taskIds: CloudToolsTaskIdEnum[] | null;
  statusIds: CloudToolsStatusIdEnum[] | null;
  fromDate: Date | null;
  toDate: Date | null;
  sortBy: string;
  sortDescending: boolean;
}

export enum CloudToolsTaskIdEnum {
  PCRCleanup = 1,
  SandBoxCleanUp = 2,
  LCMUpdate = 3,
}

export enum CloudToolsStatusIdEnum {
  InProgress = 1,
  Failed = 2,
  Success = 3,
}

export interface TransactionResponse {
  transactions: Transactions[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  timestamp: string;
  message: string | null;
}

export interface Transactions {
  id: string;
  createdOn: string;
  createdBy: string;
  taskId: number;
  taskName: string;
}

export interface TransactionDetailsRequest {
  parentId: string;
  statusIds: CloudToolsStatusIdEnum[];
  pageNumber: number;
  pageSize: number;
}

export interface TransactionDetailsResponse {
  transactions: TransactionDetails[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  timestamp: string;
  message: string | null;
}

export interface TransactionDetails {
  id: number;
  parentId: string;
  transactionId: string;
  statusId: CloudToolsStatusIdEnum;
  status: 'Success' | 'InProgress' | 'Failed';
  createdDate: string;
  updatedDate: string | null; // null - in case of failure & inProgress
  payload: TransactionDetailsPayload | string | null; // JSON Object | null - from API
  response: NormalizedTransactionDetailsResponse | string | null; // JSON Object | null - from API
  url: string;
  regionKey: string;
}

export interface NormalizedTransactionDetailsResponse {
  Status: 'SUCCESS' | 'FAILED';
  TransactionId?: string;
  VendorId?: string | null;
  ErrorCode?: string;
  ErrorMessage?: string;
  ErrorDetails?: TransactionDetailsErrorResponseDetails[];
}
export interface TransactionDetailsErrorResponseDetails {
  message: string;
}

export interface TransactionDetailsPayloadCallbackInformation {
  callbackUrl: string;
  expiryDate: string; // ISO string
}

export interface TransactionDetailsPayloadScheduledAction {
  scheduleType: string;
  actionType: string;
}

export interface TransactionDetailsPayloadCustomFields {
  customerId: string;
  scheduledActions?: TransactionDetailsPayloadScheduledAction[];
}

export interface TransactionDetailsPayload {
  customFields?: TransactionDetailsPayloadCustomFields;
  subscriptionId?: string;
  callbackInformation?: TransactionDetailsPayloadCallbackInformation;
  autoRenewalStatus?: boolean;
  customerId?: string;
  domain?: string;
  partnerCenterName?: string;
  ionCustomerName?: string;
}

export interface NewTaskBtnMenu {
  emit: CloudTools;
  display: string;
  uploadAPIURL: string;
  uploadTemplateURL: string;
}


export interface ColumnConfig {
  id: number;
  key: string;
  name: string;
  width?: string;
  formatter: (d: TransactionDetails) => string;
}