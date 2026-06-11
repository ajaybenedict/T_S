import { resolveEnvironment } from "./environment_resolver";

export const API_BASE_URL_LOCAL = 'http://localhost:57425';
export const CORE_BASE_URL_LOCAL = 'http://localhost:52580';
export const API_BASE_URL_INT = 'https://int-streamone-api.tdsynnex.org';
export const CORE_BASE_URL_INT = 'https://int-streamone-api.tdsynnex.org';
export const API_BASE_URL_UAT = 'https://uat-streamone-api.tdsynnex.org';
export const CORE_BASE_URL_UAT = 'https://uat-streamone-api.tdsynnex.org';
export const API_BASE_URL_PROD = 'https://streamone-api.tdsynnex.org';
export const CORE_BASE_URL_PROD = 'https://streamone-api.tdsynnex.org';
export const API_PATH_PPC = 'api-ppc';
export const CORE_PATH_AI = 'core-ai';
export const API_PATH_PRODUCT = 'api-product';
export const API_V1 = 'api/v1';
export const HOSTNAME_INT = 'int-streamone-hub.tdsynnex.org';
export const HOSTNAME_UAT = 'uat-streamone-hub.tdsynnex.org';
export const HOSTNAME_PROD = 'streamone-hub.tdsynnex.org';
export const HOSTNAME_LOCAL = 'localhost';
export const REDIRECT_URI_INT = 'https://int-streamone-hub.tdsynnex.org/sso';
export const REDIRECT_URI_UAT = 'https://uat-streamone-hub.tdsynnex.org/sso';
export const REDIRECT_URI_LOCAL = 'http://localhost:4000/sso';
export const REDIRECT_URI_STREAMONE = 'https://streamone-hub.tdsynnex.org/sso';
export const SSO_CSTENET_URL = 'https://sso.cstenet.com/as/authorization.oauth2?';
export const SSO_CSTENET_URL_PROD = 'https://sso.techdata.com/as/authorization.oauth2?';
export const APP_LANDINGPAGE_INT = 'https://int-streamone-hub.tdsynnex.org/landingpage';
export const APP_LANDINGPAGE_UAT = 'https://uat-streamone-hub.tdsynnex.org/landingpage';
export const APP_LANDINGPAGE_LOCAL = 'http://localhost:4000/landingpage';
export const APP_LANDINGPAGE_STREAMONE = 'https://streamone-hub.tdsynnex.org/landingpage';
export const SSO_LOGOUT_PING_URL = 'https://sso.cstenet.com/idp/startSLO.ping';
export const SSO_LOGOUT_PING_URL_PROD = 'https://sso.techdata.com/idp/startSLO.ping';
export const TAB_VALUE_NEEDSAPPROVAL = 'Needs Approval';
export const TAB_VALUE_APPROVED = 'Approved';
export const TAB_VALUE_DECLINED = 'Declined';
export const DATE_OPTION_SEVENDAYS = 'Last 7 Days';
export const DATE_OPTION_YESTERDAY = 'Yesterday';
export const DATE_OPTION_TODAY = 'today';
export const DATE_OPTION_CUSTOM = 'custom';
export const DATE_OPTION_THIRTYDAYS = 'Last 30 Days';
export const DATE_OPTION_SIXTYDAYS = 'Last 60 Days';
export const DATE_OPTION_NINETYDAYS = 'Last 90 Days';
export const API_STATUS_NOT_STARTED = 'NotStarted';
export const API_STATUS_WIP = 'WIP';
export const API_STATUS_SUCCESS = 'Success';
export const API_STATUS_FAILED = 'Failed';
export const AZURE_AD_LOGIN_URL = 'https://login.microsoftonline.com/7fe14ab6-8f5d-4139-84bf-cd8aed0ee6b9/oauth2/v2.0/authorize?state=<state_id>&client_id=<client_id>&response_type=code&redirect_uri=<redirect_uri>&scope=<scope>';
export const AZURE_AD_LOGOUT_URL = 'https://login.microsoftonline.com/7fe14ab6-8f5d-4139-84bf-cd8aed0ee6b9/oauth2/logout?post_logout_redirect_uri=<redirect_uri>';
/** For date calculation in C3 order API request. */
export const DEFAULT_PREVIOUS_DAYS_FILTER = 7;
/** For date calculation in cloud tools transaction API request. */
export const DEFAULT_PREVIOUS_DAYS_FILTER_CLOUD_TOOLS = 7;
/** Paginator - Page size - Cloud Tools. */
export const DEFAULT_PAGE_SIZE_CLOUD_TOOLS = 10;
/** Paginator - Page size options. */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10,25,50,100];
export const REVENUE_AI_BREADCRUMB = 'Cloud Data Assistant';
export const HUB_AI_BREADCRUMB = 'Ask Assistant';
/** Pagintaor - Page size - C3 dashboard. */
export const PPC_DASHBOARD_PAGE_SIZE = 10;
export const PPC_CALENDAR_MIN_DAYS = 90;
export const QUESTIONS_ALLOWED_PER_THREAD = 10;
export const THREAD_NAME_MIN_CHAR = 1;
export const THREAD_NAME_MAX_CHAR = 100;
export const REMOTE_ENTRY_URL = resolveEnvironment().REMOTE_ENTRY_URL;
export const BILLINGUI_BASE_URL = resolveEnvironment().REMOTE_BASE_URL;
export const INSIGHT_DASHBOARD_ROUTE = {
    PARAM_NAME: 'report-name',
    RESOLVER: 'reportData',
    MS_SECURITY_URL: 'ms-security',
    MS_PAC_SUBS_URL: 'ms-pac-subs',
    BILLING_RECON_URL: 'billing-recon',
    REVENUE_DASHBOARD_URL: 'revenuedashboard',
    EXCHANGE_RATE_URL: 'exchange-rate',
    ION_REGIONAL_OVERVIEW: 'ion-regional-overview',
    REVENUE_DASHBOARD_PHASE2_URL: 'revenuedashboard-phase2',
    ION_ORDER_DATA_URL: 'ion-order-data',
    END_CUSTOMER_CHURN_URL: 'end-customer-churn',
    USER_USAGE_REPORT_URL: 'user-usage-insights',
    KPI_REPORT_URL: 'kpi-dashboard',
    RESELLER_CHURN_URL: 'reseller-churn',
};
export const INSIGHT_NO_PERMISSION_REPORTS = [INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL];
export const LANDING_PAGE = {
    WELCOME_TEXT: 'Welcome',
    WELCOME_CONTENT: `Welcome to StreamOne Operations Hub! You've successfully logged in.
    The following modules are designed to help you manage and monitor your cloud operations with ease. Select a module to get started`,
    LOGOUT_CONTENT: 'You have been logged out successfully from the StreamOne Operations Hub, but still logged in with Microsoft.',
    MICROSOFT_LOGOUT_TXT: 'To completely logout from Microsoft?',
    LOGIN_AGAIN_TXT: 'To login again to StreamOne Operations Hub?',
};
export const APP_ROUTE_CONFIG_URL = {
    C3_DASHBOARD: 'c3-dashboard',
    SSO: 'sso',
    CBC_DASHBOARD: 'cbcdashboard',
    COLLECTION_SKU_MAPPING: 'CollectionSKUMaping',
    ERROR_PAGE: 'errorpage',
    LANDING_PAGE: 'landingpage',
    LOGOUT: 'logout',
    INSIGHTS: 'insights',
    DATA_DISCOVERY: 'datadiscovery',
    RULE_ENGINE: 'rule-engine',
    PPC_DASHBOARD: 'ppcdashboard',
    QA_LOGIN: 'qalogin',
    CLOUD_TOOLS: 'cloud-tools',

};
export const CLOUD_TOOLS_ROUTE = {
    EST_MANAGER: 'est-manager',
    PCR_CLEANUP: 'pcr-cleanup',
    SANDBOX_CLEANUP: 'sandbox-cleanup',
    UPDATE_MPNID: 'update-mpnid',
    SUBS_TRANSFER: 'subscription-transfer',
    RESOLVER: 'toolType',
};
export const ROUTE_DATA_KEYS = {
    ANIMATION: 'animation',
    APPLICATION_ID: 'applicationId',
    PERMISSIONS: 'permissions',
    COUNTRY_REGION_CHECK: 'countryRegionCheck',
};
export const RULE_ENGINE_ROUTE_CONFIG_URL = {
    EDIT: 'edit',
    EDIT_PARAM_ID: 'edit/:id',
};
export const DISCLAIMER_TEXT = {
    AI_ASSISTANT: 'Data is based on the latest ION Revenue reports and may be subject to sync delays. Please verify critical insights with official sources.',
    RULE_ENGINE: 'Amounts will be automatically converted to USD based on the applicable exchange rate.',
    HUB_ASSISTANT: 'AI‑generated responses may not always be perfect. Please review important information before taking action.'
};
export const DOCUMENT_URL = {
  EASY_VISTA: '/assets/docs/Easy_Vista_UserGuide.pdf',
  INSIGHT: '/assets/docs/InsightUserGuide.pdf',
  C3: '/assets/docs/Cloud Credit Connector User Guide.pdf',
  REVENUE: '/assets/docs/Revenue_Dashboard_AI_Assistant_UG_v1.pdf',
  EST_TEMPLATE: '/assets/docs/Sample_ESTM_Template.csv',
  PCR_TEMPLATE: '/assets/docs/Sample_PCR_Template.csv',
  UPDATE_MPNID_TEMPLATE: '/assets/docs/Sample_UpdateMPNID_Template.csv',
  SANDBOX_TEMPLATE: '/assets/docs/Sample_Sandbox_Template.csv',
  REGIONAL_OVERVIEW_GUIDE: '/assets/docs/Regional_Overview_Dashboard_UG_V1.pdf',
  REVENUE_DASHBOARD_PHASE2_GUIDE: '/assets/docs/Revenue_Dashboard_Phase2_UG_V1.pdf',
  ION_ORDER_DATA_GUIDE: '/assets/docs/SION_OrderData_UG_V1.pdf',
  END_CUSTOMER_CHURN_GUIDE: '/assets/docs/End_Customer_Churn_UG_V1.pdf',
  CBC_GUIDE: '/assets/docs/CBC_UG_V1.pdf',
  MPNID_USER_GUIDE: '/assets/docs/Update MPNID_User guide.pdf',
  SANDBOX_USER_GUIDE: '/assets/docs/Sandbox Cleanup_User guide.pdf',
  EST_MANAGER_USER_GUIDE: '/assets/docs/EST Manager_User guide.pdf',
  PCR_CLEANUP_USER_GUIDE: '/assets/docs/PCR Cleanup_User guide.pdf',
  SUBSCRIPTION_TRANSFER_USER_GUIDE: '/assets/docs/Subscription_Transfer_UserGuide.pdf',
};
export const INSIGHT_USER_GUIDE_ALLOWED_ROUTES = [
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL}`,
    `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL}`,
];
export const C3_USER_GUIDE_ALLOWED_ROUTES = [
    `/${APP_ROUTE_CONFIG_URL.C3_DASHBOARD}`,
];
export const CBC_USER_GUIDE_ALLOWED_ROUTES = [
    `/${APP_ROUTE_CONFIG_URL.CBC_DASHBOARD}`,
];
export const CLOUD_TOOLS_USER_GUIDE_ALLOWED_ROUTES = [
  `/${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}/${CLOUD_TOOLS_ROUTE.EST_MANAGER}`,
  `/${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}/${CLOUD_TOOLS_ROUTE.PCR_CLEANUP}`,
  `/${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}/${CLOUD_TOOLS_ROUTE.SANDBOX_CLEANUP}`,
  `/${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}/${CLOUD_TOOLS_ROUTE.UPDATE_MPNID}`,
  `/${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}/${CLOUD_TOOLS_ROUTE.SUBS_TRANSFER}`,
];
export const C3_DASHBOARD_NEEDSAPPROVAL_TOOLTIP = {
    DISCONTINUED: {
        TITLE: 'Account Discontinued',
        CONTENT: 'This account is discontinued. Certain actions or order processing may be restricted.'
    },
    RESTRICTED: {
        TITLE: 'Credit on Hold',
        CONTENT: 'Account is on Credit Hold – New orders may be blocked.'
    },
};
export const FRAUD_ALERT_POPUP_INPUTS = {
    TYPE: 'type',
    EVENT_ID: 'eventId',
    SUB_ID: 'subId',
    REGION: 'region',
    VENDOR_ID: 'vendorid',
    PLATFORM: 'platform',
};
export const PARTNER_CENTER = {
    AUTH_URI: 'https://api.partnercenter.microsoft.com',
    FRAUD_EVENTS_RESOURCE_URI: 'https://api.partnercenter.microsoft.com/v1/fraudEvents?SubscriptionId=',
};
export const FRAUD_ALERT_EVENT_API = {
    RESPONSE: {
        UPDATED: 'Status updated',
        NOT_UPDATED: 'Status not updated',
    },
    DISPLAY_MESSAGE: {
        UPDATED: 'Fraud event has been updated',
        NOT_UPDATED: 'We could not process this update request',
    },
    LOADING: 'Status Loading...',
    NO_STATUS: 'No Status Returned',
    IDENTICAL: 'Event status is identical please update',
};
export const AI_OVERVIEW_ELEMENT_NAME = 'ai-summary';
export const C3_AI_SUMMARY_ASSISTANT_ID = 2;
export const AI_OVERVIEW_DISCLAIMER_TEXT = 'The information displayed is applicable only to the current page.';
export const CLOUD_TOOLS_CONFIRMATION_DIALOG = {
    DEFAULT_HEADER: 'Confirmation',
    DEFAULT_CONTENT: 'Are you sure you want to proceed? This action is permanent and cannot be undone.',
    UPLOAD_CONTENT: 'Are you sure you want to Upload the selected data into the system?',
    CUSTOMER_PREVIEW_CONTENT: 'Are you sure you want to upload the selected data into the system?',
    NO_CUSTOMER_FOUND_CONTENT: 'No customers found for the MPIN ID and region provided. Cannot proceed further.',
};
export const CLOUD_TOOLS_UPLOAD_WARNING = {
    MSG: 'Confirm all details before submitting. All updates are permanent and can’t be reversed.',
    CUSTOMER_PREVIEW_MSG: 'Confirmation will update. All updates are permanent and cannot be reversed.',
};

// Allowed email domains for rule-engine and cloud-tools recipient validations.
export const c3RuleEngineAlertRecipientAllowedDomains: readonly string[] = ['tdsynnex.com', 'techdata.com', 'myTecD.com'];
export const UTC_TIMEZONE = 'UTC';
//Bulk update Fraud Event Response Messages
export const BULK_UPDATE_FRAUD_EVENT_MESSAGES = {
    NO_STATUS_SELECTED: 'Please select at least one event status to proceed.',
    NO_EVENTS_IN_THE_GRID: 'There are no events available for bulk update.',
    RESOLVED_STATUS_SELECTED: 'You can\'t perform a bulk update for events in \'Resolved\' status.',
    MORE_THAN_ONE_STATUS_SELECTED: 'Select only one event status to proceed a bulk update.',
    REPORT_LOADING: 'The report is still loading. Please wait before attempting a bulk update.',
    PRECHECK_SUCCESS_MESSAGE: 'You may proceed with the bulk update for the selected events',
    API_FAILURE: 'Failed to update event status. Please try again.',
    INVALID_STATUS: 'Invalid event status selected. Please choose a valid status.',
};
export const BULK_UPDATE_FRAUD_EVENT_OPERATOR ={
    NOTIN : 'NotIn',
    IN: 'In',
}
export const BULK_UPDATE_TABLE = 'FraudEvents';
export const BULK_UPDATE_COLUMN = 'Event Status';
export const EVENT_TIME_FILTER_TYPE = 4;
export const EVENT_TIME_COLUMN_NAME = 'Event Time';
/**
 * Constants for the Microsoft Fraud Events report.
 *
 * Note: This report uses custom country/region filtering because it is displayed
 * across two tabs, making its filtering logic different from the common scenario.
 */
export const MICROSOFT_FRAUD_EVENTS_REPORT_NAME = 'MicrosoftFraudEvents';
export const MICROSOFT_FRAUD_EVENTS_AZURE_CONSUMPTION_SPIKE_LABEL = 'Azure Consumption Spike';
export const MICROSOFT_FRAUD_EVENTS_DB = 'FraudEvents';
export const MICROSOFT_FRAUD_EVENTS_AZURE_CONSUMPTION_SPIKE_DBS = [
  'FraudEventsUsage',
  'FraudEventUsage-Lakehouse',
];

//  Rule Engine - Confirmation dialog content when user tries to switch rule type with unsaved changes
export const RULE_ENGINE_TYPE_SWITCH_CONFIRMATION_DIALOG = {
    HEADER: 'Confirm Rule Change',
    CONTENT: "Switching the rule type will remove the changes you've made. Would you like to proceed?",
};

export const BOOTSTRAP_5_HREF = '/c3-bootstrap.css';
export const BOOTSTRAP_2_HREF = `${BILLINGUI_BASE_URL}assets/legacy/Content/bootstrap2.css`;