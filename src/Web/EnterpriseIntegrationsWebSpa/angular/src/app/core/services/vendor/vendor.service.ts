import { Injectable } from "@angular/core";
import { DataState } from "../data-state";
import { API_PATH_PPC, API_V1 } from "../../constants/constants";
import { HttpClient } from "@angular/common/http";
import { PostRequest, PostResponse, UpdateFraudEventStatusRequest } from "src/app/models/vendor/vendor-api.models";
import { Observable } from "rxjs";
import { BulkUpdateFraudEventRequest, BulkUpdateFraudEventResponse } from "src/app/models/insights/insights-dashboard-api-response.interface";

@Injectable({ providedIn: 'root' })

export class VendorService {

  constructor(
    private readonly dataState: DataState,
    private readonly http: HttpClient,
  ) { }

  private readonly baseURI = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/Vendor`;
  
  post(data: PostRequest): Observable<PostResponse[]> {
    return this.http.post<PostResponse[]>(`${this.baseURI}/Post`, data);
  }

  updateFraudEventStatus(data: UpdateFraudEventStatusRequest): Observable<string> {
    return this.http.post(`${this.baseURI}/UpdateFraudEventStatus`, data, {
      responseType: 'text'
    });
  }

  getFraudEvents(body: BulkUpdateFraudEventRequest): Observable<BulkUpdateFraudEventResponse> {
    const url = `${this.baseURI}/getfraudevents`;
    return this.http.post<BulkUpdateFraudEventResponse>(url, body);
  }


  bulkUpdateFraudEventStatus(data: UpdateFraudEventStatusRequest[]): Observable<string> {
    return this.http.post(`${this.baseURI}/BulkUpdateFraudEventStatus`, data, {
      responseType: 'text'
    });
  }
}