import { DatePipe } from "@angular/common";
import { CloudToolsStatusIdEnum, NormalizedTransactionDetailsResponse, TransactionDetails, TransactionDetailsPayload, Transactions } from "../models/cloud-tools/cloud-tools.interface";
import { DialogType, PPCDialogData } from "../models/ppc-dialog-data.model";
import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { S1Menu } from "../models/s1/s1-menu.interface";
import { CLOUD_TOOLS_CONFIRMATION_DIALOG, CLOUD_TOOLS_UPLOAD_WARNING, UTC_TIMEZONE } from "../core/constants/constants";

type CloudToolsDisplayValue = string | number | null | undefined;

export class CloudToolsHelper {

  /**
   * Filename-safe character validation and sanitization.
   * Allowed: A-Z, a-z, 0-9, spaces, hyphens (-), underscores (_)
   * Disallowed: everything else
   */
  private static readonly INVALID_FILENAME_CHARS_PATTERN = /[^a-zA-Z0-9 _-]/g;

  /**
   * Sanitizes a string by removing all except allowed characters.
   * @param value The string to sanitize
   * @returns The sanitized string with only allowed characters
   */
  public static sanitizeFilenameString(value: string): string {
    return value.replace(this.INVALID_FILENAME_CHARS_PATTERN, '');
  }

  static getCustomerTenantId(payload: TransactionDetailsPayload | null | undefined): string {
    if (!payload) return '';

    const extendedPayload = payload as TransactionDetailsPayload & {
      customerTenantId?: string;
      customFields?: {
        customerTenantId?: string;
        customerId?: string;
      };
    };

    return (
      extendedPayload.customerTenantId ??
      extendedPayload.customerId ??
      extendedPayload.customFields?.customerTenantId ??
      extendedPayload.customFields?.customerId ??
      ''
    );
  }

  public static getPpcDialogData(
    type: Extract<DialogType, 'SubsTransferCustomerPreviewConfirmation' | 'SubsTransferNoCustomerFound'>
  ): PPCDialogData {
    switch (type) {
      case 'SubsTransferCustomerPreviewConfirmation':
        return {
          header: CLOUD_TOOLS_CONFIRMATION_DIALOG.DEFAULT_HEADER,
          content: CLOUD_TOOLS_CONFIRMATION_DIALOG.CUSTOMER_PREVIEW_CONTENT,
          primaryBtnName: 'Confirm',
          primaryBtnAction: 'confirm',
          validationErrorMsg: CLOUD_TOOLS_UPLOAD_WARNING.CUSTOMER_PREVIEW_MSG,
          type,
        };

      case 'SubsTransferNoCustomerFound':
        return {
          header: CLOUD_TOOLS_CONFIRMATION_DIALOG.DEFAULT_HEADER,
          content: CLOUD_TOOLS_CONFIRMATION_DIALOG.NO_CUSTOMER_FOUND_CONTENT,
          primaryBtnName: 'Rework',
          primaryBtnAction: 'rework',
          type,
        };

      default:
        return this.throwUnsupportedDialogType(type);
    }
  }

  private static throwUnsupportedDialogType(value: never): never {
    throw new Error(`CloudToolsHelper.getPpcDialogData: unsupported dialog type '${value}'.`);
  }

  public static getDefaultColumns(datePipe: DatePipe): S1DataTableColumn[] {
    return [
      {
        displayName: 'Transaction Details',
        columnKey: 'transactionDetails', formatter: (data: Transactions) =>
          `<div class="s1-FW700">${data.id}</div>
            <div class="s1-C-Stone">${CloudToolsHelper.getOrderDateTime(data.createdOn, 'date', datePipe)} | ${CloudToolsHelper.getOrderDateTime(data.createdOn, 'time', datePipe)} | ${UTC_TIMEZONE}</div>`,
        isSortable: false,
        columnType: 'html',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 1,
        isClickable: true,
        enableEllipsisTooltip: true,
      },
      {
        displayName: 'Task Type',
        columnKey: 'taskType',
        formatter: (data: Transactions) => `<span class="s1-FW700">${data.taskName}</span>`,
        isSortable: false,
        columnType: 'html',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 3,
        isClickable: true,
      },
      {
        displayName: 'Created by',
        columnKey: 'createdBy',
        formatter: (data: Transactions) => `<span class="s1-FW700 s1-C-CG10">${data.createdBy}</span>`,
        isSortable: false,
        columnType: 'html',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 4,
        isClickable: true,
      },
    ];
  }

  private static readonly SUBS_TRANSFER_COLUMN_CONFIG = [
    { columnID: 0, columnKey: 'region', displayName: 'Region' },
    { columnID: 1, columnKey: 'customerTenantId', displayName: 'Customer Tenant ID' },
    { columnID: 2, columnKey: 'sourcePartnerName', displayName: 'Source Partner Name' },
    { columnID: 3, columnKey: 'sourcePartnerTenantId', displayName: 'Source Partner Tenant ID' },
    { columnID: 4, columnKey: 'customerEmailId', displayName: 'Customer Email ID' },
  ];

  private static readonly DEFAULT_COLUMN_CONFIG: Partial<S1DataTableColumn> = {
    isSortable: false,
    cellAlignment: 'start',
    columnType: 'text',
    headerAlignment: 'start',
  };

  private static createColumn(config: { columnID: number; columnKey: string; displayName: string }): S1DataTableColumn {
    return {
      ...this.DEFAULT_COLUMN_CONFIG,
      ...config,
      key: config.columnKey,
    } as S1DataTableColumn;
  }

  public static getSubsTransferCustomerPreviewColumns(): S1DataTableColumn[] {
    return this.SUBS_TRANSFER_COLUMN_CONFIG.map(config => this.createColumn(config));
  }

  public static getCloudToolsMenu() {
    const data: S1Menu = {
      hasIcon: true,
      hasName: false,
      iconURL: '/assets/thread_more_icon_24_24.svg',
      hoverIcon: '/assets/thread_more_icon_hover_24_24.svg',
      displayName: 'Menu',
      subMenu: [
        {
          hasIcon: true,
          iconURL: '/assets/show_log_24_24.svg',
          hasName: true,
          displayName: 'Show Log',
          onClickEmit: 'Show Log',
        },
        {
          hasIcon: true,
          iconURL: '/assets/NeedsApproval.svg',
          hasName: true,
          displayName: 'Retry',
          onClickEmit: 'Retry',
        },
        {
          hasIcon: true,
          iconURL: '/assets/download_arrow_black_24_24.svg',
          hasName: true,
          displayName: 'CSV Download',
          onClickEmit: 'CSV Download',
        }
      ],
    };
    return data;
  }

  public static getActionsColumn(): S1DataTableColumn {
    return {
      displayName: 'Actions',
      columnKey: 'Actions',
      isSortable: false,
      columnType: 'dropdown',
      columnWidth: '3%',
      headerAlignment: 'center',
      cellAlignment: 'center',
      columnID: 5,
      dropdown: CloudToolsHelper.getCloudToolsMenu(),
    };
  }

  public static getOrderDateTime(data: string, type: 'date' | 'time', datePipe: DatePipe) {
    const date = new Date(data);
    return type == 'date' ? datePipe.transform(date, 'dd MMM, yyyy') : datePipe.transform(date, 'hh:mm a');
  }

  /**
  * Normalizes the transaction payload into a usable object.
  *
  * The payload received from the API can be:
  *  - `null`
  *  - a JSON string
  *  - an already-parsed `TransactionDetailsPayload` object
  *
  * This method safely:
  *  - Parses JSON strings
  *  - Returns the object as-is if already parsed
  *  - Handles invalid JSON gracefully
  *
  * @param payload Raw transaction payload from `TransactionDetails`
  * @returns Parsed `TransactionDetailsPayload` object or `null` if invalid/unavailable
  */
  private static normalizeTransactionPayload(
    payload: TransactionDetails['payload']
  ): TransactionDetailsPayload | null {
    if (!payload) return null;

    try {
      return typeof payload === 'string'
        ? (JSON.parse(payload) as TransactionDetailsPayload)
        : payload;
    } catch {
      return null;
    }
  }

  /**
  * Formats a specific value from the transaction payload for table display.
  *
  * This helper:
  *  - Normalizes the raw payload
  *  - Extracts a specific field using the provided extractor function
  *  - Wraps the extracted value with a styled HTML span
  *
  * @param data Transaction row data
  * @param extractor Function used to extract a displayable value from the payload
  * @returns Formatted HTML string for table rendering
  */
  static formatTransactionPayload(
    data: TransactionDetails,
    extractor: (payload: TransactionDetailsPayload) => CloudToolsDisplayValue
  ): string {
    const payload = this.normalizeTransactionPayload(data.payload);
    if (!payload) return '';

    return `
    <span class="s1-FW700 s1-FS14px s1-C-Charcoal">
      ${extractor(payload) ?? ''}
    </span>
  `;
  }

  /**
  * Formats a direct property from the TransactionDetails object for table display.
  *
  * This helper is similar to formatTransactionPayload but extracts from direct
  * properties on TransactionDetails (like azurePlan, budget) rather than from
  * the nested payload.
  *
  * Use this for properties defined at the top level of TransactionDetails.
  *
  * @param data Transaction row data
  * @param extractor Function used to extract a displayable value from TransactionDetails
  * @returns Formatted HTML string for table rendering
  *
  * @example
  * // Extract azurePlan property
  * CloudToolsHelper.formatTransactionDetails(
  *   data,
  *   d => d.azurePlan ? 'Azure Plan' : 'No Plan'
  * )
  *
  * @example
  * // Extract budget property
  * CloudToolsHelper.formatTransactionDetails(
  *   data,
  *   d => d.budget ? 'Budgeted' : 'Not Budgeted'
  * )
  */
  static formatTransactionDetails(
    data: TransactionDetails,
    extractor: (details: TransactionDetails) => CloudToolsDisplayValue
  ): string {
    if (!data) return '';

    const value = extractor(data);
    if (value == null) return '';

    return `
    <span class="s1-FW700 s1-FS14px s1-C-Charcoal">
      ${value}
    </span>
  `;
  }

  /**
 * Normalizes the transaction response into a consistent internal format.
 *
 * Handles:
 *  - null
 *  - JSON string
 *  - already-parsed response
 *  - casing differences from backend (status vs Status)
 */
  static normalizeTransactionResponse(
    response: TransactionDetails['response']
  ): NormalizedTransactionDetailsResponse | null {

    if (!response) return null;

    let parsed: any;

    try {
      parsed = typeof response === 'string' ? JSON.parse(response) : response;
    } catch {
      return null;
    }

    if (!parsed || typeof parsed !== 'object') return null;

    // Lowercase variant
    if ('status' in parsed) {
      return {
        Status: parsed.status,
        ErrorCode: parsed.errorCode,
        ErrorMessage: parsed.errorMessage,
        ErrorDetails: parsed.errorDetails,
      };
    }

    // PascalCase variant
    if ('Status' in parsed) {
      return {
        Status: parsed.Status,
        TransactionId: parsed.TransactionId,
        VendorId: parsed.VendorId,
        ErrorCode: parsed.ErrorCode,
        ErrorMessage: parsed.ErrorMessage,
        ErrorDetails: parsed.ErrorDetails,
      };
    }

    return null;
  }

  /**
   * Extracts ErrorMessage from transaction response regardless of response shape.
   *
   * The API may return `response` as either a JSON string or an already parsed
   * object, and error key casing can vary by endpoint.
   *
   * @param response Raw transaction response from API
   * @returns Error message string when present; otherwise empty string
   */
  static getTransactionErrorMessage(response: TransactionDetails['response']): string {
    if (!response) return '';

    let parsed: unknown;
    try {
      parsed = typeof response === 'string' ? JSON.parse(response) : response;
    } catch {
      return '';
    }

    if (!parsed || typeof parsed !== 'object') return '';

    const normalized = parsed as { ErrorMessage?: unknown; errorMessage?: unknown };
    const value = normalized.ErrorMessage ?? normalized.errorMessage;
    return typeof value === 'string' ? value : '';
  }


  static isTransactionSuccessResponse(
    response: unknown
  ): response is NormalizedTransactionDetailsResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'Status' in response &&
      (response as NormalizedTransactionDetailsResponse).Status === 'SUCCESS'
    );
  }

  static isTransactionErrorResponse(
    response: unknown
  ): response is NormalizedTransactionDetailsResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'Status' in response &&
      (response as NormalizedTransactionDetailsResponse).Status === 'FAILED'
    );
  }

  /**
 * Formats a value from the transaction response for table display or CSV export.
 *
 * This helper:
 *  - Normalizes the raw response
 *  - Extracts a displayable value using the provided extractor
 *  - Optionally wraps the value with styled HTML (for UI)
 *
 * @param data Transaction row data
 * @param extractor Function to extract a value from the response
 * @param format Output format ('html' | 'text')
 * @returns Formatted string (HTML or plain text)
 */
  static formatTransactionResponse(
    data: TransactionDetails,
    extractor: (response: NormalizedTransactionDetailsResponse) => CloudToolsDisplayValue,
    format: 'html' | 'text'
  ): string {
    const response = this.normalizeTransactionResponse(data.response);
    if (!response) return '';

    const value = extractor(response);
    if (value == null) return '';

    // Always return plain text for CSV
    if (format === 'text') {
      return String(value);
    }

    // If extractor already returns HTML (used for Status)
    if (typeof value === 'string' && value.trim().startsWith('<span')) {
      return value;
    }

    return `
    <span class="s1-FW700 s1-FS14px s1-C-Charcoal">
      ${value}
    </span>
  `;
  }


  static capitalizeFirst(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  static styleStatusColumn(type: CloudToolsStatusIdEnum, value: string): string {
    if (!value) return value;
    switch (type) {
      case CloudToolsStatusIdEnum.Success:
        return `<span class="s1-FW700 s1-FS12px s1-BR-4px s1-P-4-8-px s1-BG-Forest s1-C-Forest">${value}</span>`;
      case CloudToolsStatusIdEnum.Failed:
        return `<span class="s1-FW700 s1-FS12px s1-BR-4px s1-P-4-8-px s1-BG-Cherry s1-C-Cherry">${value}</span>`;
      default:
        return `<span class="s1-FW700 s1-FS12px s1-BR-4px s1-P-4-8-px s1-BG-LegacyOcean s1-C-LegacyOcean">${value}</span>`;
    }
  }

  /**
   * Formats a boolean | null value for display.
   *
   * Converts:
   *  - true         → 'Yes'
   *  - false        → 'No'
   *  - null/undefined → empty string
   *
   * @param value Boolean value or null
   * @returns Formatted string representation
   */
  static formatBooleanValue(value: boolean | null | undefined): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return '';
  }
}