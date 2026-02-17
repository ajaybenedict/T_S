import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiDataResponse } from '../../../AIAssistant/models/api-data-response';
import { DisplayEntity } from '../../../AIAssistant/models/display-entity';
import { environment } from '../../../environments/environment.int'; // Adjust the path as necessary
import { DataState } from '../data-state';

@Injectable({
  providedIn: 'root'
})


export abstract class ApiDataService {
  abstract getApiData(functionName: string, argumentParams: any, pageToken: any): Observable<any>;
  abstract getDisplayComponent(functionName: string, argumentParams?: any): DisplayEntity | null;
  public apiSource = "";
  //public apiDataBaseUrl = ``;
  //public apiBaseProxyUrl = `${environment.coreapiuri}/api/ApiData/proxy`;

  public prefix = (window.location.href.includes('localhost')) ? "" : "/core-ppc"
  public apiDataBaseUrl = ``
  public apiBaseProxyUrl = ``;


  public displayTitle: any = "Below are results that match your criteria.";
  public isTruncateLongFields: boolean = true; 
  public pageSizeDefault = 10;
  public isInlineAnalysis = true;
  public ionApiKey: string = "";
  public systemMessage = "";
  public prompts = { showPrompts: true, defaultPromptsNo: 12 }

  public ApiDataService() {
  }
  public mapToResponse(response: any, data: any): ApiDataResponse{
    let apiDataResponse: ApiDataResponse = {};
    apiDataResponse.data = data
    apiDataResponse.isError = false;
    apiDataResponse.error = "";
    if (response.parameters)
      apiDataResponse.pagination = { nextPageToken: response.parameters.page }

    return apiDataResponse;

  }

  public handleError(error: HttpErrorResponse): Observable<ApiDataResponse> {
    // Define a default error response structure
    let erroObj = "";
    if (error && error.error)
      erroObj = JSON.stringify(error.error);

    const errorResponse: ApiDataResponse = {
      data: [], // Depending on your case, you might not want to return any data on error
      error: `Failed to fetch data: ${error.message} Error Details: ${erroObj}`,
      isError: true
    };
    
    // Return an observable with the error response
    return of(errorResponse);
  }

  public addCommonHeaders(headers?: HttpHeaders): HttpHeaders {
    headers = new HttpHeaders();
    headers = headers.append('apiSource', this.apiSource);
   // headers = headers.append('X-RapidAPI-Host', this.apiDataBaseUrl);
    // Add more headers as needed
    return headers;
  }

  public objectToQueryString(params: any): string {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return queryString;
  }

  public appendQueryStringToUrl(baseUrl: string, params: any): string {
    const queryString = this.objectToQueryString(params);
    return `${baseUrl}${queryString ? '?' + queryString : ''}`;
  }
 


}
