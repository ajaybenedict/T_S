import { ReportCandidate } from "src/app/core/config/insight-dashboard.config";

export interface InsightsDashboardResponse {
  accessToken: string;
  embedUrl: string;
  reportId: string;
}

export interface InsightResolverResponse {
  reportCandidate: ReportCandidate[];
  reportData: InsightsDashboardResponse;
}

export interface InsightFilterPageModel {
  Database: string;
  RegionColumn: string | undefined;
  CountryColumn: string;
}

export interface BulkUpdateFraudEventResponseItem {
  countrySecurityKey: string;
  eventId: string;
  subscriptionId: string;
  eventStatus: string;
  resolvedReason: string;
  vendorId: string;
}

export interface BulkUpdateFraudEventRequest {
  eventTime: string[];
  severity: string[];
  pac: string[];
  region: string[];
  country: string[];
  eventStatus: string[];
  reseller: string[];
  customer: string[];
  confidenceLevel: string[];
  eventType: string[];
  pageNumber: number;
  pageSize: number;
}

export interface BulkUpdateFraudEventResponse {
  items: BulkUpdateFraudEventResponseItem[];
  totalRows: number;
}