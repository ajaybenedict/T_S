import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductSyncAPIRequest, ProductSyncAPIResponse } from 'src/app/models/product-sync-history-api.model';
import { API_STATUS_NOT_STARTED } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SkuUploadDataService {

  private productSyncRequestData: ProductSyncAPIRequest = {
    IsSuccessHistory: false,
    pageNumber: 1,
    pageSize: 25,
    searchTerm: '',
  }

  private productSyncHistoryRes = new BehaviorSubject<ProductSyncAPIResponse | null>(null);
  private productSyncHistoryReq = new BehaviorSubject<ProductSyncAPIRequest>(this.productSyncRequestData);
  private uploadSKUBatchAPIStatus = new BehaviorSubject<string>(API_STATUS_NOT_STARTED);
  private storageAPIStatus = new BehaviorSubject<string>(API_STATUS_NOT_STARTED);
  private newFileUpload = new BehaviorSubject<boolean>(false);
  private isInitialProductSyncCall = new BehaviorSubject<boolean>(false);
  
  private isSKUAuthError = new BehaviorSubject<boolean>(false);
  productSyncHistoryRes$ = this.productSyncHistoryRes.asObservable();
  productSyncHistoryReq$ = this.productSyncHistoryReq.asObservable();
  uploadSKUBatchAPIStatus$ = this.uploadSKUBatchAPIStatus.asObservable();
  storageAPIStatus$ = this.storageAPIStatus.asObservable();
  newFileUpload$ = this.newFileUpload.asObservable();
  isInitialProductSyncCall$ = this.isInitialProductSyncCall.asObservable();
  isSKUAuthError$ = this.isSKUAuthError.asObservable();

  setIsSKUAuthError(value: boolean) {
    this.isSKUAuthError.next(value);
  }
  setProductSyncHistoryRes(value: ProductSyncAPIResponse) {       
    this.productSyncHistoryRes.next(value);
  }
  setProductSyncHistoryReq(value: Partial<ProductSyncAPIRequest>) {    
    let tempData: ProductSyncAPIRequest = {...this.productSyncRequestData, ...value};
    this.productSyncRequestData = {...tempData};
    this.productSyncHistoryReq.next(this.productSyncRequestData);
  }
  setUploadSKUBatchAPIStatus(value: string) {
    this.uploadSKUBatchAPIStatus.next(value);
  }
  setStorageAPIStatus(value: string) {
    this.storageAPIStatus.next(value);
  }
  setNewFileUpload(value: boolean) {
    this.newFileUpload.next(value);
  }
  setIsInitialProductSyncCall(value: boolean) {
    this.isInitialProductSyncCall.next(value);
  }
}
