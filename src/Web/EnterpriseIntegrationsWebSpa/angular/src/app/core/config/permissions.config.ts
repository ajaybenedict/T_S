/**
 * Permission ids used by frontend authorization checks.
 */
export enum PermissionsEnum {
    GlobalAdmin = 1,
    PreProvisioningOrderApproval = 2,
    IdentityUserManagement = 5,
    PreProvisioningCredit = 10,
    BillingConnector = 11,
    IonProductSyncTool = 12,
    AIAssistants = 13,
    RuleViewer = 14,
    RuleEditor = 15,
    //Insights Permissions
    MSGdap = 21,
    MSFraudEvents = 22,
    MSMfa = 23,
    MSSubscriptionDetail = 24,
    MSAzureReserverInstance = 25,
    MSCustomers = 26,
    MSOrders = 27,
    MSCustomerTransfer = 28,
    MSReconciliationFiles = 29,
    IONBillingReconciliation = 30,
    IONRevenue = 31,
    IONChurnAnalysis = 32,
    IONOrderData = 33,
    ResellerChurn = 34,
    PlatformSummaryV3 = 35, //ION-Regional-Overview
    // Insights dashboard/tile-level permissions - Story 950874/950875
    InsightMicrosoftSubscription = 37,
    InsightMicrosoftSecurity = 38,
    InsightBilling = 39,
    InsightExecutive = 40,
    InsightSIONData = 41,
    // CloudTools Permission
    ESTManager = 51,
    SandBoxCleanUp = 52,
    PCRCleanUp = 53,
    UpdateMPNID = 54,
    SubscriptionTransfer = 55,
};

/**
 * Application ids aligned with IsAuthorized API userPermissions[].applicationId.
 */
export enum ApplicationIdEnum {
    StreamOneHub = 1,
    C3 = 2,
    CBC = 3,
    Insight = 4,
    CloudTools = 5,
}

// Add the permissions for insight to this array always. This will decide the module to load or not while navigating.
export const INSIGHTS_DASHBOARD_PERMISSIONS = [
    PermissionsEnum.InsightMicrosoftSubscription,
    PermissionsEnum.InsightMicrosoftSecurity,
    PermissionsEnum.InsightBilling,
    PermissionsEnum.InsightExecutive,
    PermissionsEnum.InsightSIONData,
];

// Add cloud tools permissions to this array for module-level route matching checks.
export const CLOUD_TOOLS_DASHBOARD_PERMISSIONS = [
    PermissionsEnum.ESTManager,
    PermissionsEnum.SandBoxCleanUp,
    PermissionsEnum.PCRCleanUp,
    PermissionsEnum.UpdateMPNID,
    PermissionsEnum.SubscriptionTransfer,
];
