import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { API_STATUS_WIP } from 'src/app/core/constants/constants';
import { PpcOverlayService } from 'src/app/core/services/ppc-overlay.service';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { SkuUploadDataService } from 'src/app/core/services/sku-upload-data.service';
import { SkuUploadService } from 'src/app/core/services/sku-upload.service';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { PPCPageChangeEventData, PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { PPCTableColumnData } from 'src/app/models/ppc-table-column.model';
import { ProductSyncAPIRequest, ProductSyncAPIResponse } from 'src/app/models/product-sync-history-api.model';
@Component({
  selector: 'app-last-uploaded',
  templateUrl: './last-uploaded.component.html',
  styleUrls: ['./last-uploaded.component.css']
})
export class LastUploadedComponent implements OnInit, OnDestroy, AfterViewInit {  
  
  declare productSyncHistoryData: ProductSyncAPIResponse;
  declare syncResSubs: Subscription; 
  declare syncReqSubs: Subscription;
  declare tableColumns: PPCTableColumnData[];
  declare navTabs: PPCNavData[]; 
  declare paginatorData: PPCPaginatorData;
  declare pageChangeEventSubs: Subscription;
  declare uploadSKUAPISubs: Subscription;
  declare storageAPISubs: Subscription;
  declare isNewFileUploadSubs: Subscription;
  declare isInitialSyncCallSubs: Subscription;

  tabSelected: string = 'Error';
  tableLoader: boolean = false;  
  isNewFileUpload: boolean = false;  
  isInitalSyncCall: boolean = false;
  productSyncRequestData: ProductSyncAPIRequest = {
    IsSuccessHistory: false,
    pageNumber: 1,
    pageSize: 25,
    searchTerm: '',
  };

  @ViewChild('skuDataTable', {static: false}) declare skuDataTable: TemplateRef<any>;

  constructor(    
    private skuDataSVC: SkuUploadDataService, 
    private skuUploadSVC: SkuUploadService,
    private ppcPaginatorDataSVC: PpcPaginatorDataService,
    private ppcOverlaySVC: PpcOverlayService,
  ) {}

  ngOnInit(): void {      
    this.isInitialSyncCallSubs = this.skuDataSVC.isInitialProductSyncCall$.subscribe({
      next: res => this.isInitalSyncCall = res
    });
    this.isNewFileUploadSubs = this.skuDataSVC.newFileUpload$.subscribe({
      next: res => this.isNewFileUpload = res
    });
    this.syncResSubs = this.skuDataSVC.productSyncHistoryRes$.subscribe({
      next: (res) => {
        if(res) {          
          this.productSyncHistoryData = res;
          this.tableLoader = false;
          this.ppcOverlaySVC.hide();
          this.initPaginator(); 
          this.tabSelected = this.productSyncRequestData.IsSuccessHistory ? 'Success' : 'Error';          
        }
      }
    });
    this.syncReqSubs = this.skuDataSVC.productSyncHistoryReq$.subscribe({
      next: (res) => {
        if(res) {
          this.productSyncRequestData = res;          
          if(this.isInitalSyncCall || this.isNewFileUpload) {
            this.isInitalSyncCall = false;
            this.isNewFileUpload = false;                      
            return;
          };
          this.getProductSyncHistory();
        }
      }
    });
    this.pageChangeEventSubs = this.ppcPaginatorDataSVC.ppcPageChangeEventData$.subscribe({
      next: res => {
        if(res) {
          this.pageChangeHandler(res);
        }
      }
    });
    this.uploadSKUAPISubs = this.skuDataSVC.uploadSKUBatchAPIStatus$.subscribe({
      next: res => {
        if(res && res === API_STATUS_WIP) {
          this.ppcOverlaySVC.show();
        } else {
          this.ppcOverlaySVC.hide();
        }
      }
    });
    this.storageAPISubs = this.skuDataSVC.storageAPIStatus$.subscribe({
      next: res => {
        if(res && res == API_STATUS_WIP) {
          this.ppcOverlaySVC.show();          
        } else {
          this.ppcOverlaySVC.hide();
        }
      }
    });
  }
  ngAfterViewInit(): void {
    this.initTableColumns();
    this.initNavTabs();
  }
  get isOverlayEnabled(): Observable<boolean> {
    return this.ppcOverlaySVC.ppcOverlay$;
  }
  setProductSyncReqData(data: Partial<ProductSyncAPIRequest>) {       
    this.skuDataSVC.setProductSyncHistoryReq(data);
  }
  initTableColumns() {    
    this.tableColumns = [
      {
        columnName: 'Scope', // table column header
        key: 'environment', // match the name of the element in the response
        width: '15%'
      },
      {
        columnName: 'Account ID',
        key: 'accountId',
        width: '15%'
      },
      {
        columnName: 'Product ID',
        key: 'productId',
        width: '15%'
      },
      {
        columnName: 'Product Name',
        key: 'productName',
        width: '15%'
      },
      {
        columnName: 'Sync Message',
        key: 'message',
        width: '40%'
      },
    ]; 

  }
  initNavTabs() {    
    this.navTabs = [
      {
        label: 'Error',
        tabContent: this.skuDataTable
      },
      {
        label: 'Success',
        tabContent: this.skuDataTable
      }
    ];    
  }  
  initPaginator() {
    if(this.productSyncHistoryData) {
      this.paginatorData = {
        page: this.productSyncRequestData.pageNumber,
        pageSize: this.productSyncRequestData.pageSize,
        total: this.productSyncHistoryData.totalRecordCount,
      };
      this.ppcPaginatorDataSVC.setPPCPaginatorData(this.paginatorData);
    }
  }
  tabChangeHandler(event: number) {        
    this.tabSelected = event == 1 ? 'Success' : 'Error';
    let dataToSend: Partial<ProductSyncAPIRequest> = {
      pageNumber: 1,
      pageSize: 25,      
    }; 
    if(this.tabSelected === 'Error') {
      dataToSend.IsSuccessHistory = false;
    } else {
      dataToSend.IsSuccessHistory = true;
    }   
    this.setProductSyncReqData(dataToSend);       
  }
  pageChangeHandler(event: PPCPageChangeEventData) { 
    const dataToSend: Partial<ProductSyncAPIRequest> = {
      pageNumber: event.page,
      pageSize: event.pageSize
    };    
    this.setProductSyncReqData(dataToSend);
    this.paginatorData.pageSizeOption = [event.pageSize];
    this.ppcPaginatorDataSVC.setPPCPaginatorData(this.paginatorData);
  }
  getProductSyncHistory() {
    this.tableLoader = true;  
    this.ppcOverlaySVC.show();     
    this.skuUploadSVC.productSyncHistory(this.productSyncRequestData).subscribe({
      next: (res) => {                   
        this.skuDataSVC.setProductSyncHistoryRes(res);        
      },      
    });    
  }
  ngOnDestroy(): void {
    if(this.syncReqSubs) this.syncReqSubs.unsubscribe();
    if(this.syncResSubs) this.syncResSubs.unsubscribe();
    if(this.uploadSKUAPISubs) this.uploadSKUAPISubs.unsubscribe();
    if(this.storageAPISubs) this.storageAPISubs.unsubscribe();
    if(this.isInitialSyncCallSubs) this.isInitialSyncCallSubs.unsubscribe();
    if(this.isNewFileUploadSubs) this.isNewFileUploadSubs.unsubscribe();
  }
}
