import { S1ActionBar } from "src/app/models/s1/s1-action-bar.interface";
import { INSIGHT_DASHBOARD_ROUTE } from "../constants/constants";
import { PermissionsEnum } from "./permissions.config";

// Add the exact report name here
export type InsightReportName =
    'MicrosoftResellerGdap' |
    'MicrosoftFraudEvents' |
    'MicrosoftMFA' |
    'VendorSubscriptionDetail' |
    'Orders' |
    'MicrosoftCustomerTransferData' |
    'IONBillingReconciliation' |
    'GlobalRevenue' |
    'CustomerChurnAnalysis' |
    'MSReconciliation' |
    'CurrencyExchange'|
    'PlatformSummaryV3'|
    'RevenueDashboardV3'|
    'IONOrderDataV3'|
    'CustomerChurnV3';

export const url2ReportNameMapper: Record<string, InsightReportName> = {
    [INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL]: 'MicrosoftResellerGdap',
    [INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL]: 'VendorSubscriptionDetail',
    [INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL]: 'MSReconciliation',
    [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL]: 'GlobalRevenue',
    [INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL]: 'CurrencyExchange',
    [INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW]: 'PlatformSummaryV3',
    [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL]: 'RevenueDashboardV3',
    [INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL]: 'IONOrderDataV3',
    [INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL]: 'CustomerChurnV3',
};

export interface RegionPermission {
    Country: string[];
    Region: string[];
};

export interface ReportCandidate {
  reportName: InsightReportName;
  permissionKey?: PermissionsEnum; // PermissionsEnum or backend permission string
  label?: string;                 // tab label (optional; fallback to reportName)
  priority?: number;              // lower comes first
  defaultPage?: string;    // optional default pageName for this report
};

export const routeToReportCandidates: Record<string, ReportCandidate[]> = {
  // use the same keys as INSIGHT_DASHBOARD_ROUTE.<...>
  [INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL]: [
    { reportName: 'MicrosoftResellerGdap', permissionKey: PermissionsEnum.MSGdap, label: 'GDAP', priority: 1, defaultPage: 'ReportSectionebe2dda19d7563972795' },    
    { reportName: 'MicrosoftFraudEvents', permissionKey: PermissionsEnum.MSFraudEvents, label: 'Fraud Events', priority: 2, defaultPage: 'ReportSectiona1c0ca346464e424ec64' },        
    // { reportName: 'MicrosoftFraudEvents', permissionKey: PermissionsEnum.MSFraudEvents, label: 'Fraud Events Consumption Spike', priority: 3, defaultPage: 'ReportSectionf0d4a40abf1e4cd351ec' },
    { reportName: 'MicrosoftMFA', permissionKey: PermissionsEnum.MSMfa, label: 'Customers MFA and Access Policies', priority: 3 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL]: [
    { reportName: 'VendorSubscriptionDetail', permissionKey: PermissionsEnum.MSSubscriptionDetail, label: 'Microsoft Pac Subscription Data', priority: 1, defaultPage: 'ReportSection' },
    { reportName: 'VendorSubscriptionDetail', permissionKey: PermissionsEnum.MSAzureReserverInstance, label: 'Azure Reserved Instances', priority: 2, defaultPage: 'ReportSection77a2d4919b65196a97e1' },
    { reportName: 'VendorSubscriptionDetail', permissionKey: PermissionsEnum.MSCustomers, label: 'Microsoft Pac Customer Data', priority: 3, defaultPage: 'ReportSection6486548fd51eb21c6e77' },
    { reportName: 'Orders', permissionKey: PermissionsEnum.MSOrders, label: 'Microsoft Order Data', priority: 4, defaultPage: 'ReportSection' },
    { reportName: 'MicrosoftCustomerTransferData', permissionKey: PermissionsEnum.MSCustomerTransfer, label: 'Microsoft Customer Transfer Data', priority: 5, defaultPage: 'ReportSection' },
  ],
  [INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL]: [
    { reportName: 'MSReconciliation', permissionKey: PermissionsEnum.MSReconciliationFiles, label: 'MS Reconciliation Files', priority: 1 },
    { reportName: 'IONBillingReconciliation', permissionKey: PermissionsEnum.IONBillingReconciliation, label: 'ION Billing Reconciliation', priority: 2 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL]: [
    { reportName: 'GlobalRevenue', permissionKey: PermissionsEnum.IONRevenue, priority: 1 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL]: [
    { reportName: 'CurrencyExchange', priority: 1 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW]: [
    { reportName: 'PlatformSummaryV3', permissionKey: PermissionsEnum.PlatformSummaryV3, label: 'StreamOne ION Regional Overview', priority: 1 }
  ],
  [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL]: [
    { reportName: 'RevenueDashboardV3', permissionKey: PermissionsEnum.GlobalAdmin, priority: 1 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL]: [
    { reportName: 'IONOrderDataV3', permissionKey: PermissionsEnum.IONOrderData, priority: 1 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL]: [
    { reportName: 'CustomerChurnV3', permissionKey: PermissionsEnum.GlobalAdmin, priority: 1 },
  ],
};

export const insightActionBarConfig: S1ActionBar = {
    title: 'Actions',
    buttons: [
        {
            displayName: 'Reset All',
            imgAlt: 'ResetAll',
            iconSrc: '/assets/insight_reset_all_icon_24_24.svg',
            onClickEmitValue: 'ResetAll',
        }
    ],
};

// Country/Region check at tab level restriction will be handled from this config. Route level restrictions will be handled at guard.
export const countryRegionRestrictionTabList = [
  PermissionsEnum.MSMfa,
];