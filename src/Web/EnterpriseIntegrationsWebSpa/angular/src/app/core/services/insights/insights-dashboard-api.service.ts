import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { DataState } from '../data-state';
import { API_PATH_PPC, API_V1 } from '../../constants/constants';
import { InsightsDashboardResponse } from "src/app/models/insights/insights-dashboard-api-response.interface";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class InsightsDashboardApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly dataState: DataState,
  ) { }

  private readonly baseURI = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}`;

  getAccessToken(report: string, page?: string): Observable<InsightsDashboardResponse> {
    const path = page ? `/${page}` : '';
    const url = `${this.baseURI}/Insights/GetAccessToken/${report}${path}`;
    return this.http.get<InsightsDashboardResponse>(url);
  }
}