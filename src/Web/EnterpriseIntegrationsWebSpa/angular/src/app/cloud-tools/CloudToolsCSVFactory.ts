import { TransactionDetails, TransactionDetailsPayload } from "../models/cloud-tools/cloud-tools.interface";
import { CSVColumn } from "../models/s1/s1-csv.interface";
import { S1CommonHelper } from "../s1-common.helper";
import { CloudToolsHelper } from "./cloud-tools-helper";


export class CloudToolsCSVFactory {

  /* ---------- COMMON ---------- */
  static common(parent: { id: string; taskName: string; }): CSVColumn<TransactionDetails>[] {
    return [
      { header: 'Transaction ID', value: () => parent.id },
      { header: 'Region', value: t => t.regionKey },
      { header: 'Task Type', value: () => parent.taskName },
      { header: 'Status', value: t => t.status },
    ];
  }

  /* ---------- TOOL SPECIFIC ---------- */
  static est(): CSVColumn<TransactionDetails>[] {
    return [
      {
        header: 'Subscription ID',
        value: t => {
          const rawPayload = typeof t.payload === 'string'
            ? S1CommonHelper.safeJsonParse(t.payload)
            : t.payload;

          if (typeof rawPayload !== 'object' || rawPayload === null) {
            return '';
          }

          return (rawPayload as TransactionDetailsPayload)
            ?.subscriptionId ?? '';
        },
      },
      {
        header: 'Customer ID',
        value: t => {
          const rawPayload = typeof t.payload === 'string'
            ? S1CommonHelper.safeJsonParse(t.payload)
            : t.payload;

          if (typeof rawPayload !== 'object' || rawPayload === null) {
            return '';
          }

          return (rawPayload as TransactionDetailsPayload)
            ?.customFields?.customerId ?? '';
        },
      },
    ];
  }

  static sandbox(outputMessage: string): CSVColumn<TransactionDetails>[] {
    return [
      {
        header: 'Domain Name',
        value: t => {
          const rawPayload = typeof t.payload === 'string'
            ? S1CommonHelper.safeJsonParse(t.payload)
            : t.payload;

          if (typeof rawPayload !== 'object' || rawPayload === null) {
            return '';
          }

          return (rawPayload as TransactionDetailsPayload)
            ?.domain ?? '';
        },
      },
      {
        header: 'Output Message',
        value: () => outputMessage,
      },
    ];
  }

  static pcr(outputMessage: string): CSVColumn<TransactionDetails>[] {
    return [
      {
        header: 'Customer Tenant ID',
        value: t => {
          const rawPayload = typeof t.payload === 'string'
            ? S1CommonHelper.safeJsonParse(t.payload)
            : t.payload;

          if (typeof rawPayload !== 'object' || rawPayload === null) {
            return '';
          }

          return (rawPayload as TransactionDetailsPayload)
            ?.customerId ?? '';
        },
      },
      {
        header: 'Output Message',
        value: () => outputMessage,
      },
    ];
  }

  static success(): CSVColumn<TransactionDetails>[] {
    return [
      {
        header: 'Updated At',
        value: t => S1CommonHelper.formatDateUS(t.updatedDate),
      },
    ];
  }

  /* ---------- ERROR ---------- */
  static error(): CSVColumn<TransactionDetails>[] {
    return [
      {
        header: 'Error Message',
        value: t => {
          return CloudToolsHelper.formatTransactionResponse(
            t,
            r => CloudToolsHelper.isTransactionErrorResponse(r)
              ? CloudToolsHelper.capitalizeFirst(r.ErrorMessage ?? '')
              : '',
            "text"
          );
        },
      },
      {
        header: 'Error Details',
        value: t => {
          return CloudToolsHelper.formatTransactionResponse(
            t,
            r => CloudToolsHelper.isTransactionErrorResponse(r)
              ? CloudToolsHelper.capitalizeFirst(r.ErrorDetails?.[0]?.message ?? '')
              : '',
            "text"
          );
        },
      },
    ];
  }
}
