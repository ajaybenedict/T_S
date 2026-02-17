import { DatePipe } from "@angular/common";
import { CloudToolsStatusIdEnum, NormalizedTransactionDetailsResponse, TransactionDetails, TransactionDetailsPayload, Transactions } from "../models/cloud-tools/cloud-tools.interface";
import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { S1Menu } from "../models/s1/s1-menu.interface";

export class CloudToolsHelper {

  public static getDefaultColumns(datePipe: DatePipe): S1DataTableColumn[] {
    return [
      {
        displayName: 'Transaction Details',
        columnKey: 'transactionDetails', formatter: (data: Transactions) =>
          `<div class="s1-FW700">${data.id}</div>
            <div class="s1-C-Stone">${CloudToolsHelper.getOrderDateTime(data.createdOn, 'date', datePipe)} | ${CloudToolsHelper.getOrderDateTime(data.createdOn, 'time', datePipe)}</div>`,
        isSortable: false,
        columnType: 'html',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 1,
        isClickable: true,
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
    extractor: (payload: TransactionDetailsPayload) => string | number | null | undefined
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
    extractor: (response: NormalizedTransactionDetailsResponse) => string | number | null | undefined,
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
}