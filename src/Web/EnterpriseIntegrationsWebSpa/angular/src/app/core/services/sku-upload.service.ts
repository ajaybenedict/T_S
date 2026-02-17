import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SKUUploadReqData, SKUUploadResponseData } from 'src/app/models/sku-upload-response.model';
import { DataState } from './data-state';
import { API_PATH_PRODUCT, API_V1 } from '../constants/constants';
import { ProductSyncAPIRequest, ProductSyncAPIResponse } from 'src/app/models/product-sync-history-api.model';
import { Observable } from 'rxjs';
import { UploadFileResData } from 'src/app/models/storage-api.model';

@Injectable({
  providedIn: 'root'
})
export class SkuUploadService {

  private uploadEndpoint = this.dataState.getBaseUrl() + '/' + API_PATH_PRODUCT + '/' + API_V1;

  constructor(
    private http: HttpClient,
    private dataState: DataState,
  ) { }

  uploadFile(data: FormData) {
    const apiEndpoint = this.uploadEndpoint + '/product/uploadskus';
    return this.http.post<SKUUploadResponseData[]>(apiEndpoint, data);
  }

  uploadSKUBatch(data: SKUUploadReqData) {
    const apiEndpoint = this.uploadEndpoint + '/product/uploadskubatch';
    return this.http.post<SKUUploadResponseData[]>(apiEndpoint, data);
  }

  productSyncHistory(data: ProductSyncAPIRequest) {
    const apiEndpoint = this.uploadEndpoint + '/product/ProductSyncHistory';
    return this.http.post<ProductSyncAPIResponse>(apiEndpoint, data);
  }

  downloadFile(batchId: string) {
    const apiEndpoint = this.uploadEndpoint + '/product/downloadfile/' + batchId;
    const headers = new HttpHeaders({'Content-Type':'text/csv; charset=utf-8', 'Accept': 'text/csv'});
    return this.http.get(apiEndpoint, {responseType: 'blob', observe: 'response', headers});
  }

  downloadHistory(batchId: string): Observable<HttpResponse<Blob>> {
    const apiEndpoint = this.uploadEndpoint + '/product/downloadhistory/' + batchId;
    const headers = new HttpHeaders({'Content-Type':'text/csv; charset=utf-8', 'Accept': 'text/csv'});
    return this.http.get(apiEndpoint, {responseType: 'blob', observe: 'response', headers});
  }

  uploadFileToStorage(data: FormData) {
    const apiEndpoint = this.uploadEndpoint + '/product/uploadfile';
    return this.http.post<UploadFileResData>(apiEndpoint, data);
  }

  deleteFileFromStorage(batchId: string) {
    const apiEndpoint = this.uploadEndpoint + '/product/cancelupload/' + batchId;
    return this.http.get<boolean>(apiEndpoint);
  }
}
