
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDetailsRequest } from '../models/productDetailsRequest.model';
import { API_ENTRY_URL } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductCollectionService {
  public apiUrl: string = API_ENTRY_URL;
  //TODO move the below two variables to base.service
  public billingOrdersApiBaseUrl: string = "/BillingOrdersApi/";
  public collectionSkuApiBaseUrl: string = "/CollectionSKUApi/";
  constructor(private http: HttpClient) { }

 
  getVendorname(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${this.billingOrdersApiBaseUrl}GetVendorNames`);
  }

  getCountryname(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${this.billingOrdersApiBaseUrl}GetCountryCodes`);
  }

  getCollectionSKUDetails(productDetailsRequest: ProductDetailsRequest) {
    return this.http.post<any>(`${this.apiUrl}${this.collectionSkuApiBaseUrl}GetCollectionSkus`, productDetailsRequest);
  }

  saveProduct(obj: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${this.collectionSkuApiBaseUrl}InsertUpdateProductDetails`, obj);
  }

  collectionskuExport(ERPCode: any, searchFor?: number, searchValue?: any): Observable<HttpResponse<any>> {
    let obj = {
      SearchText: searchValue ? searchValue : '',
      SearchFor: searchFor ? searchFor : 0,
      ERPCode: ERPCode
    }
    return this.http.post<any>(`${this.apiUrl}${this.collectionSkuApiBaseUrl}ExportCollectionSKUData`, obj);
  }

  getERPName(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${this.billingOrdersApiBaseUrl}GetERPName`);
  }

  getCloudProviders(): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiUrl}${this.billingOrdersApiBaseUrl}GetCloudProviders`);
  }
}
