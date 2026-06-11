import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { InsightsDashboardApiService } from "../core/services/insights/insights-dashboard-api.service";
import { catchError, map, of } from "rxjs";
import { InsightResolverResponse, InsightsDashboardResponse } from "../models/insights/insights-dashboard-api-response.interface";
import { ReportCandidate, routeToReportCandidates } from "../core/config/insight-dashboard.config";
import { DataState } from "../core/services/data-state";
import { ApplicationIdEnum } from "../core/config/permissions.config";

function candidateIsAllowed(dataState: DataState, cand: ReportCandidate): boolean {
  // If no permissionKey defined => public (allowed)
  if (cand.permissionKey === undefined || cand.permissionKey === null) return true;

  // Normalize permissionKey to array and check any match using app-scoped permission checks;
  // GlobalAdmin bypass is handled within dataState.hasPermission (see its implementation).
  const req = Array.isArray(cand.permissionKey) ? cand.permissionKey : [cand.permissionKey];
  return dataState.hasPermission(req, ApplicationIdEnum.Insight);
}

export const insightDashboardResolverFn: ResolveFn<InsightResolverResponse | null> = (route: ActivatedRouteSnapshot) => {
    const insightSVC = inject(InsightsDashboardApiService);
    const dataState = inject(DataState);

    const urlKey = route.routeConfig?.path ?? route.url[0]?.path ?? '';
    if (!urlKey) {
      console.warn(`Insight resolver: Invalid or missing route key.`);
      return of(null);
    }
    
    const candidates: ReportCandidate[] = (routeToReportCandidates[urlKey] || []).slice();
    if (!candidates.length) {
      console.warn(`Insight resolver: No report candidates found for "${urlKey}".`);
      return of(null);
    }

    candidates.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    // filter allowed candidate
    const allowedCandidate = candidates.filter(c => candidateIsAllowed(dataState, c));

    if (!allowedCandidate) {
        console.warn(`No accessible report for "${urlKey}".`);
        return of(null);
    }

    const reportName = allowedCandidate[0].reportName;        
    return insightSVC.getAccessToken(reportName, allowedCandidate[0].defaultPage).pipe(
        map((response: InsightsDashboardResponse) => ({
            reportCandidate: allowedCandidate,
            reportData: response,
        })),
        catchError(err => {
            console.error(`"${reportName}" in Insight dashboard token service got failed with error message - ${err}.`);
            return of(null);
        })
    );
}