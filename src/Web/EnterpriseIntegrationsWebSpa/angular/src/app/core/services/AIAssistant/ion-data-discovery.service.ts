import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { DisplayEntity } from '../../../AIAssistant/models/display-entity';
import { ApiDataService } from './api-data-service';
import { ApiDataResponse } from '../../../AIAssistant/models/api-data-response';
import { DisplayIonData } from '../../../AIAssistant/EntityConfiguration/DisplayIonData';
import { DataState } from '../data-state';
import { API_PATH_PPC, API_V1 } from '../../constants/constants';

@Injectable({
  providedIn: 'root'
})

export class IonDataDiscoveryApiDataService extends ApiDataService {  
 
  constructor(private http: HttpClient, private dataState: DataState) {
    super();  
    this.apiDataBaseUrl = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/assistant`; 
    this.isTruncateLongFields = false;
  }

  getApiData(functionName: any, argumentsParams: any, pageToken: any = null): Observable<any> {

    this.isTruncateLongFields = false;
    switch (functionName) {
      case "getRevenueData":
        this.displayTitle = " "; //use space else open ai api will return error
        return this.getRevenueData(argumentsParams, pageToken);
      case "getRevenueDataInsights":
        this.displayTitle = " "; //use space else open ai api will return error
        return this.getRevenueDataInsights(argumentsParams, pageToken);
      default:
        return of(null);
    }

  }

  getDisplayComponent(functionName: any, argumentParams: any = null): DisplayEntity | null {
    return DisplayIonData;  
  }


  getRevenueData(argumentParams: any, pageToken = null): Observable<any> {
    let apiUrl = `${this.apiDataBaseUrl}/data`;

    let request = {
      dataDiscoveryTable: { database: "ebc", query: argumentParams.sqlQuery }
    }

    if (argumentParams)
    console.log(argumentParams.sqlQuery)
    return this.http.post<ApiDataResponse>(`${apiUrl}`, request, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let apiResponse = this.mapToResponse(response, response.data)
        if (response && response.currentPage)
          apiResponse.pagination = { nextPageToken: response.currentPage + 1 }
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }



  getRevenueDataInsights(argumentParams: any, pageToken = null): Observable<any> {
    let apiUrl = `${this.apiDataBaseUrl}/data`;

    let request = {
      dataDiscoveryTable: { database:"insights" , query: argumentParams.sqlQuery }
    }

    return this.http.post<ApiDataResponse>(`${apiUrl}`, request, { headers: this.addCommonHeaders() })
      .pipe(map((response: any) => {
        let apiResponse = this.mapToResponse(response, response.data)
        if (response && response.currentPage)
          apiResponse.pagination = { nextPageToken: response.currentPage + 1 }
        return apiResponse;
      }
      ),
        catchError(this.handleError));
  }



  addPageToken(apiUrl: any, nextPageToken: any) {
    if (nextPageToken)
      apiUrl = `${apiUrl}&page=${nextPageToken}`

    return apiUrl;
  }
 
}

