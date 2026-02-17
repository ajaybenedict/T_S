import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {  map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class DataDiscoveryService {
  private apiUrl = 'http://localhost:55102/api/v1';

  constructor(private router: Router, private http: HttpClient) {
    if (window.location.href.includes('int')) {
      this.apiUrl = 'https://int-streamone-api.tdsynnex.org/core-ppc/api/v1'
    }
  }

  public initialPrompt: string = "";
  public dataSetId: any = "";
  public schemaResponse: any = ""
  getData(dataDiscoveryRequest: any) {  
    return this.http.post<HttpResponse<any>>( this.apiUrl +"/DataDiscovery/data", dataDiscoveryRequest)
      .pipe(map((response: any) => {
        return response;
      }))
  }
  getDataSetSchema(dataDiscoveryTable: any) {
    return this.http.post<HttpResponse<any>>(this.apiUrl +"/DataDiscovery/Schema/", dataDiscoveryTable)
      .pipe(map((response: any) => {
        this.schemaResponse = response;
        return response;
      }))
  }

  getConfig() {
    return this.http.get<HttpResponse<any>>(this.apiUrl +"/DataDiscovery/Config/", {})
      .pipe(map((response: any) => {
        this.schemaResponse = response;
        return response;
      }))
  }

  getUser() {
    return this.http.get<HttpResponse<any>>(this.apiUrl +"/DataDiscovery/getDataDiscoveryUser/", {})
      .pipe(map((response: any) => {
        this.schemaResponse = response;
        return response;
      }))
  }

  saveUser(dataDiscoveryUser: any) {
    return this.http.post<HttpResponse<any>>(this.apiUrl +"/DataDiscovery/saveDataDiscoveryUser/", dataDiscoveryUser)
      .pipe(map((response: any) => {
        this.schemaResponse = response;
        return response;
      }))
  }


  downloadCsv(dataDiscoveryTable: any): Observable<HttpResponse<Blob>> {
    // Set headers to specify the response type as blob
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.apiUrl +"/DataDiscovery/download/", dataDiscoveryTable, {
      responseType: 'blob',
      observe: 'response',
      headers: headers,
    });
  }

  setInitialPrompt() {
    this.initialPrompt =`You are an AI assistant that is able to convert natural language into a properly formatted SQL query.
The table you will be querying is called "${this.dataSetId}".Here is the schema of the table:
   ${this.schemaResponse.schema}
You must always generate queries for SQL Server
You must always use Top
You must always ensure all queries return maximum 100 rows while using top
You must always return only one query
You must always include a summary of this conversation in less than 100 letters and populate the json field as below
You must always output your answer in JSON format with the following key - value pairs:
    - "query": the SQL query that you generated
    - "error": an error message if the query is invalid, or null if the query is valid
    - "response": your response in text
    - "summary": summary of this conversation in less than 100 letters

      `


//    this.initialPrompt = `You are an AI assistant that is able to convert natural language into a properly formatted SQL query.
//The table you will be querying is called "${this.dataSetId}".Here is the schema of the table:
//   ${this.schemaResponse.schema}
//You must always generate queries for SQL Server
//You must always ensure all queries have a fetch for pagination and not more than 100 rows for first page.
//You must not use Top
//You must always include a total row count with column name TotalRows as last column prior to using fetch
//You must always output your answer in JSON format with the following key - value pairs:
//    - "query": the SQL query that you generated
//    - "error": an error message if the query is invalid, or null if the query is valid
//    - "response": your response in text

//      `
  }

  getSchema() {
    return "";
  }
 
}
