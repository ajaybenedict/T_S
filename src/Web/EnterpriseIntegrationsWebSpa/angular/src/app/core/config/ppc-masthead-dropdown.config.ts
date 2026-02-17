import { PPCMastheadDropdown, PPCMastheadDropdownCategory } from "src/app/models/ppc-masthead-dropdown.model";
import { APP_ROUTE_CONFIG_URL, INSIGHT_DASHBOARD_ROUTE } from "../constants/constants";

export const ppcMastheadDropdownConfig: PPCMastheadDropdown[] = [
    {
        title: 'Cloud Billing Connector',
        iconURL: '/assets/ebc_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.CBC_DASHBOARD}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.General,
    },
    {
        title: 'Cloud Credit Connector',
        iconURL: '/assets/ppc_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.C3_DASHBOARD}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.General,
    },    
    {
        title: 'MS PAC Subscription Data',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'Microsoft Security',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'Billing Reconciliation',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'Revenue Dashboard',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'Exchange Rate Dashboard',
        iconURL: '/assets/exchange_rate_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'Operation Tools',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.CloudTools,
    },
    {
        title: 'Regional Overview',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'Revenue Dashboard V2',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'S-ION Order Data',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
    {
        title: 'End Customer Churn',
        iconURL: '/assets/insights_dropdown_icon_24_24.svg',
        navigationURL: `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL}`,
        isEnabled: true,
        category: PPCMastheadDropdownCategory.Insights,
    },
];
