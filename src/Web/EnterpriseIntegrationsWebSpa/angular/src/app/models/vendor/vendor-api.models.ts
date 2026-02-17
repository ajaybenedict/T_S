export interface PostRequest {
    authType: VendorAuthType;
    apiType: VendorApiType;
    region: string;
    vendorId: number;
    authResourceUri: string;
    resourceUri: string;
}

export enum VendorAuthType {
    VertexAppCreds = 1,
    Oauth = 2
}

export enum VendorApiType {
    Vertex = 1,
    Graph = 2
}

export interface PostResponse {
    eventType: string;
    severity: string;
    confidenceLevel: string;
    displayName: string;
    description: string;
    country: string;
    valueAddedResellerTenantId: string;
    valueAddedResellerFriendlyName: string;
    subscriptionName: string;
    affectedResources: [];
    additionalDetails: {};
    isTest: boolean;
    activityLogs: string[];
    eventTime: string;
    eventId: string;
    partnerTenantId: string;
    partnerFriendlyName: string;
    customerTenantId: string;
    customerFriendlyName: string;
    subscriptionId: string;
    subscriptionType: string;
    entityId: string;
    entityName: string;
    entityUrl: string;
    hitCount: string;
    catalogOfferId: string;
    eventStatus: string;
    serviceName: string;
    resourceName: string;
    resourceGroupName: string;
    firstOccurrence: string;
    lastOccurrence: string;
    resolvedReason: string;
    resolvedOn: string;
    resolvedBy: string;
    firstObserved: string;
    lastObserved: string;
}

export interface UpdateFraudEventStatusRequest {
  eventIds: string;
  eventStatus: string;
  resolvedReason: string;
  SubscriptionId: string;
  Region: string;
  OldResolvedReason: string;
  OldEventStatus: string;
  VendorId: number;
}

export interface FruadAlertPopupInput {
  eventId: string;
  subId: string;
  platform: string;
  region: string;
  vendorId: number;
  type: string;
}