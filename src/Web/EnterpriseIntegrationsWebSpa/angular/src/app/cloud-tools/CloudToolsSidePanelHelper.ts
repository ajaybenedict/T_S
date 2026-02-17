import { CloudToolType } from "../core/config/cloud-tools.config";
import { TransactionDetails, TransactionDetailsPayload, FormRow, CloudToolsStatusIdEnum } from "../models/cloud-tools/cloud-tools.interface";


export class CloudToolsSidePanelHelper {

  private static stringifyResponse(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (response) {
      return JSON.stringify(response);
    }

    return '';
  }

  private static buildBaseRows(row: TransactionDetails, payload: TransactionDetailsPayload | null): FormRow[] {
    return [
      {
        label: 'Transaction ID',
        value: row.parentId ?? '',
        sortOrder: 1,
      },
      {
        label: 'Region',
        value: row.regionKey ?? '',
        sortOrder: 3,
      },
      {
        label: 'Customer Tenant ID',
        value: payload?.customerId ?? '',
        sortOrder: 4,
      }
    ];
  }

  private static buildToolSpecificRows(tool: CloudToolType, row: TransactionDetails, payload: TransactionDetailsPayload | null): FormRow[] {

    switch (tool) {

      case CloudToolType.SandboxCleanup:
        return [
          {
            label: 'VIP Correlation ID',
            value: row.transactionId ?? '',
            sortOrder: 2,
          },
          {
            label: 'Domain Name',
            value: payload?.domain ?? '',
            sortOrder: 5,
          }
        ];

      case CloudToolType.PCRCleanup:
        return [
          {
            label: 'Partner Center Name',
            value: payload?.partnerCenterName ?? '',
            sortOrder: 5,
          },
          {
            label: 'Ion Customer Name',
            value: payload?.ionCustomerName ?? '',
            sortOrder: 6,
          }
        ];

      default:
        return [];
    }
  }

  private static buildFailedOutputMessage(tab: CloudToolsStatusIdEnum, response: unknown, outputMessage?: string | null): string | null {

    if (tab !== CloudToolsStatusIdEnum.Failed) {
      return outputMessage ?? null;
    }

    const responseText = this.stringifyResponse(response);
    return `${outputMessage ?? ''} ${responseText}`.trim();
  }

  static buildDetailsFormRows(row: TransactionDetails, tool: CloudToolType, tab: CloudToolsStatusIdEnum, outputMessage?: string | null): FormRow[] {

    const payload = this.parsePayload(row.payload);

    const rows: FormRow[] = this.buildBaseRows(row, payload);

    rows.push(...this.buildToolSpecificRows(tool, row, payload));

    const finalOutputMessage = this.buildFailedOutputMessage(tab, row.response, outputMessage);

    if (finalOutputMessage) {
      rows.push({
        label: 'Output Message',
        value: finalOutputMessage,
        sortOrder: 7,
      });
    }

    return rows;
  }

  // ---------- helpers ----------
  private static parsePayload(payload: TransactionDetails['payload']): TransactionDetailsPayload | null {
    if (!payload) return null;
    try {
      return typeof payload === 'string'
        ? JSON.parse(payload)
        : payload;
    } catch {
      return null;
    }
  }
}
