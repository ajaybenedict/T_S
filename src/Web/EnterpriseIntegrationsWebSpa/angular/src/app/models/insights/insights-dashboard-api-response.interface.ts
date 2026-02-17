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

export type InsightFilterConfigModel = 
| InsightFilterPageModel
| {
  PageConfig: Record<string, InsightFilterPageModel>
  }
