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
    'CustomerChurnV3' |
    'UserUsageReport' |
    'C3KPIDashboard' |
    'CBCKPIDashboard'|
    'ResellerChurn';

export interface RegionPermission {
    Country: string[];
    Region: string[];
};

export interface InsightFilterPageModel {
  Database: string[];
  RegionColumn?: string;
  CountryColumn: string;
}

export interface ReportCandidate {
  reportName: InsightReportName;
  permissionKey?: PermissionsEnum; // PermissionsEnum or backend permission string
  label?: string;                 // tab label (optional; fallback to reportName)
  priority?: number;              // lower comes first
  defaultPage?: string;    // optional default pageName for this report
  countryCodeMap?: Readonly<Record<string, string>>; // optional: only apply for report candidates that require country code mapping, e.g. { GB: 'UK' }
  hiddenPage?: string[]; // optional list of page names to hide within the report
  filterConfig?: InsightFilterPageModel;
  isBulkUpdate?: boolean; // optional flag for report candidates that support bulk update
  raiseHyperlinkClickEvent?: boolean; // optional flag to enable RaiseEvent hyperlink behavior for a report
};

export const routeToReportCandidates: Record<string, ReportCandidate[]> = {
  [INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL]: [
    {
      reportName: 'MicrosoftResellerGdap',
      permissionKey: PermissionsEnum.InsightMicrosoftSecurity,
      label: 'GDAP',
      priority: 1,
      defaultPage: 'ReportSectionebe2dda19d7563972795',
      filterConfig: {
        Database: ['CustomerRelationship'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'MicrosoftFraudEvents',
      permissionKey: PermissionsEnum.InsightMicrosoftSecurity,
      label: 'Fraud Events',
      priority: 2,
      defaultPage: 'ReportSectiona1c0ca346464e424ec64',
      isBulkUpdate: true,
      raiseHyperlinkClickEvent: true,
      filterConfig: {
        Database: ['FraudEvents'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'MicrosoftFraudEvents',
      permissionKey: PermissionsEnum.InsightMicrosoftSecurity,
      label: 'Azure Consumption Spike',
      priority: 4,
      hiddenPage: ['ReportSectiona1c0ca346464e424ec64'],
      filterConfig: {
        Database: ['FraudEventsUsage', 'FraudEventUsage-Lakehouse'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'MicrosoftMFA',
      permissionKey: PermissionsEnum.InsightMicrosoftSecurity,
      label: 'Customers MFA and Access Policies',
      priority: 3,
      filterConfig: {
        Database: ['Customer'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL]: [
    {
      reportName: 'VendorSubscriptionDetail',
      permissionKey: PermissionsEnum.InsightMicrosoftSubscription,
      label: 'Microsoft Pac Subscription Data',
      priority: 1,
      defaultPage: 'ReportSection',
      filterConfig: {
            Database: ['Subscription'],
            RegionColumn: undefined,
            CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'VendorSubscriptionDetail',
      permissionKey: PermissionsEnum.InsightMicrosoftSubscription,
      label: 'Azure Reserved Instances',
      priority: 2,
      defaultPage: 'ReportSection77a2d4919b65196a97e1',
      filterConfig: {
            Database: ['Entitlements'],
            RegionColumn: undefined,
            CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'VendorSubscriptionDetail',
      permissionKey: PermissionsEnum.InsightMicrosoftSubscription,
      label: 'Microsoft Pac Customer Data',
      priority: 3,
      defaultPage: 'ReportSection6486548fd51eb21c6e77',
      filterConfig: {
            Database: ['Subscription'],
            RegionColumn: undefined,
            CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'Orders',
      permissionKey: PermissionsEnum.InsightMicrosoftSubscription,
      label: 'Microsoft Order Data',
      priority: 4,
      defaultPage: 'ReportSection',
      filterConfig: {
        Database: ['Orders'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'MicrosoftCustomerTransferData',
      permissionKey: PermissionsEnum.InsightMicrosoftSubscription,
      label: 'Microsoft Customer Transfer Data',
      priority: 5,
      defaultPage: 'ReportSection',
      countryCodeMap: { GB: 'UK' },
      filterConfig: {
        Database: ['customers'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL]: [
    {
      reportName: 'MSReconciliation',
      permissionKey: PermissionsEnum.InsightBilling,
      label: 'MS Reconciliation Files',
      priority: 1,
      filterConfig: {
        Database: ['Subscription'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
    {
      reportName: 'IONBillingReconciliation',
      permissionKey: PermissionsEnum.InsightBilling,
      label: 'ION Billing Reconciliation',
      priority: 2,
      filterConfig: {
        Database: ['ReportingBillingComparison'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL]: [
    {
      reportName: 'GlobalRevenue',
      permissionKey: PermissionsEnum.InsightExecutive,
      priority: 1,
      filterConfig: {
        Database: ['global_revenue'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL]: [
    { reportName: 'CurrencyExchange', priority: 1 },
  ],
  [INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW]: [
    {
      reportName: 'PlatformSummaryV3',
      permissionKey: PermissionsEnum.InsightSIONData,
      label: 'StreamOne ION Regional Overview',
      priority: 1,
      filterConfig: {
        Database: ['VwDimCountry'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    }
  ],
  [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL]: [
    {
      reportName: 'RevenueDashboardV3',
      permissionKey: PermissionsEnum.GlobalAdmin,
      priority: 1,
      filterConfig: {
        Database: ['VwDimCountry'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL]: [
    {
      reportName: 'IONOrderDataV3',
      permissionKey: PermissionsEnum.InsightSIONData,
      priority: 1,
      filterConfig: {
        Database: ['ion_ordersv3_curated'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL]: [
    {
      reportName: 'CustomerChurnV3',
      permissionKey: PermissionsEnum.GlobalAdmin,
      priority: 1,
      filterConfig: {
        Database: ['VwDimCountry'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.RESELLER_CHURN_URL]: [
    {
      reportName: 'ResellerChurn',
      permissionKey: PermissionsEnum.GlobalAdmin,
      priority: 1,
      filterConfig: {
        Database: ['VwDimCountry'],
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey'
      }
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.USER_USAGE_REPORT_URL]: [
    {
      reportName: 'UserUsageReport',
      permissionKey: PermissionsEnum.GlobalAdmin,
      priority: 1,
    },
  ],
  [INSIGHT_DASHBOARD_ROUTE.KPI_REPORT_URL]: [
    {
      reportName: 'C3KPIDashboard',
      permissionKey: PermissionsEnum.GlobalAdmin,
      priority: 1,
      label: 'C3 KPI Dashboard',
    },
    {
      reportName: 'CBCKPIDashboard',
      permissionKey: PermissionsEnum.GlobalAdmin,
      priority: 2,
      label: 'CBC KPI Dashboard',
    }
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
