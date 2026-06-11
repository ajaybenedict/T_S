import { CloudToolType } from "../core/config/cloud-tools.config";
import { TransactionDetails, TransactionDetailsPayload, FormRow, CloudToolsStatusIdEnum } from "../models/cloud-tools/cloud-tools.interface";
import { CloudToolsHelper } from "./cloud-tools-helper";


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

  private static buildBaseRows(tool: CloudToolType, row: TransactionDetails, payload: TransactionDetailsPayload | null): FormRow[] {
    if (tool === CloudToolType.UpdateMPNID || tool === CloudToolType.SubscriptionTransfer) {
      return [
        {
          label: 'Region',
          value: row.regionKey ?? '',
          sortOrder: 1,
        },
        {
          label: 'Customer Tenant ID',
          value: CloudToolsHelper.getCustomerTenantId(payload),
          sortOrder: 3,
        }
      ];
    }

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
        value: CloudToolsHelper.getCustomerTenantId(payload),
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

      case CloudToolType.UpdateMPNID:
        return [
          {
            label: 'MPNID',
            value: payload?.customFields?.mpnId ?? '',
            sortOrder: 2,
          },
          {
            label: 'Subscription ID',
            value: payload?.subscriptionId ?? '',
            sortOrder: 4,
          }
        ];
      case CloudToolType.SubscriptionTransfer:
        return [
          {
            label: 'MPNID',
            value: row?.mpnId ?? '',
            sortOrder: 2,
          },
          {
            label: 'Transfer Type',
            value: payload?.customFields?.transferType ?? '',
            sortOrder: 4,
          },
          {
            label: 'Customer Email ID',
            value: payload?.customFields?.customerEmailId ?? '',
            sortOrder: 5,
          },
          {
            label: 'Source Partner Tenant ID',
            value: payload?.customFields?.sourcePartnerTenantId ?? '',
            sortOrder: 6,
          },
          {
            label: 'Source Partner Name',
            value: payload?.customFields?.sourcePartnerName ?? '',
            sortOrder: 7,
          },
          {
            label: 'VIP Correlation ID',
            value: row.transactionId ?? '',
            sortOrder: 8,
          },
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

  /**
   * Returns response ErrorMessage in a side-panel friendly way.
   *
   * @param response Raw transaction response payload
   * @returns Extracted error message or empty string
   */
  private static getResponseErrorMessage(response: TransactionDetails['response']): string {
    return CloudToolsHelper.getTransactionErrorMessage(response);
  }

  static buildDetailsFormRows(row: TransactionDetails, tool: CloudToolType, tab: CloudToolsStatusIdEnum, outputMessage?: string | null): FormRow[] {

    const payload = this.parsePayload(row.payload);

    const rows: FormRow[] = this.buildBaseRows(tool, row, payload);

    rows.push(...this.buildToolSpecificRows(tool, row, payload));

    let finalOutputMessage = this.buildFailedOutputMessage(tab, row.response, outputMessage);

    // For UpdateMPNID success rows, prefer backend ErrorMessage over static success text.
    if (tool === CloudToolType.UpdateMPNID && tab === CloudToolsStatusIdEnum.Success) {
      const errorMessage = this.getResponseErrorMessage(row.response);
      if (errorMessage) {
        finalOutputMessage = errorMessage;
      }
    }

    if (finalOutputMessage) {
      const sortOrderMap: Partial<Record<CloudToolType, number>> = {
        [CloudToolType.UpdateMPNID]: 5,
        [CloudToolType.SubscriptionTransfer]: 9,
      };

      rows.push({
        label: 'Output Message',
        value: finalOutputMessage,
        sortOrder: sortOrderMap[tool] ?? 7,
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
