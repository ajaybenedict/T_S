import { InsightFilterConfigModel } from "src/app/models/insights/insights-dashboard-api-response.interface";
import { InsightReportName } from "./insight-dashboard.config";

export const insightFilterConfig: Partial<Record<InsightReportName, InsightFilterConfigModel>> = {
    VendorSubscriptionDetail: {
        PageConfig: {
            // Azure Reserved Instance
            ReportSection77a2d4919b65196a97e1: {
                Database: 'Entitlements',
                RegionColumn: undefined,
                CountryColumn: 'CountrySecurityKey',
            },
            // MS PAC Cust
            ReportSection6486548fd51eb21c6e77: {
                Database: 'Subscription',
                RegionColumn: undefined,
                CountryColumn: 'CountrySecurityKey',
            },
            // MS PAC Subs
            ReportSection: {
                Database: 'Subscription',
                RegionColumn: undefined,
                CountryColumn: 'CountrySecurityKey',
            },
        },
    },
    Orders: {
        Database: 'Orders',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    MicrosoftCustomerTransferData: {
        Database: 'customers',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    MicrosoftMFA: {
        Database: 'Customer',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    MicrosoftResellerGdap: {
        Database: 'CustomerRelationship',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    GlobalRevenue: {
        Database: 'global_revenue',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    IONOrderDataV3: {
        Database: 'Orders',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    RevenueDashboardV3: {
        Database: 'VwDimCountry',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    },
    CustomerChurnV3: {
        Database: 'VwDimCountry',
        RegionColumn: undefined,
        CountryColumn: 'CountrySecurityKey',
    }
};