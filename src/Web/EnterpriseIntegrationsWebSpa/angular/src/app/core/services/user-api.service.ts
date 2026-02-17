import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DataState } from "./data-state";
import { API_PATH_PPC, API_V1 } from "../constants/constants";

@Injectable({
    providedIn: 'root'
})
export class UserApiService {

    constructor(
        private http: HttpClient,
        private dataState: DataState,
    ) { }

    getUser(): Observable<any> {
      return this.http.get<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/user`);
    }

    getAppSettings(): Observable<any> {
      return this.http.get<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/configuration/GetUIConfig`);
    }

    getPPCDashboardData(obj: any): Observable<any> {
        return this.http.post<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/order/Orders`, obj);
    }

    getCountries(): Observable<any> {
        return this.http.get<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/country/Countries`);
    }

    setApproveResponse(obj: any): Observable<any> {
        return this.http.post<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/order/Approve`, obj);
    }

    setDeclineResponse(obj: any): Observable<any> {
        return this.http.post<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/order/Decline`, obj);
    }
}
