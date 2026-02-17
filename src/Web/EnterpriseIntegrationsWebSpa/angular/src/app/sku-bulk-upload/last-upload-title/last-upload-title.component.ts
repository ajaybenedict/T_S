import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SkuUploadDataService } from 'src/app/core/services/sku-upload-data.service';
import { SkuUploadService } from 'src/app/core/services/sku-upload.service';
import { ProductSyncAPIResponse } from 'src/app/models/product-sync-history-api.model';

@Component({
  selector: 'app-last-upload-title',
  templateUrl: './last-upload-title.component.html',
  styleUrls: ['./last-upload-title.component.css']
})
export class LastUploadTitleComponent implements OnInit, OnDestroy {
  lastUploadedTitle: string = 'Last Uploaded';
  searchText: string = '';
  showClearButton: boolean = false;

  declare dataSubs: Subscription;
  declare prodSyncResData: ProductSyncAPIResponse;
  declare newFileUploadSubs: Subscription;

  constructor(
    private skuDataSVC: SkuUploadDataService,
    private skuUploadSVC: SkuUploadService,
  ) { }
  ngOnInit(): void {
    this.dataSubs = this.skuDataSVC.productSyncHistoryRes$.subscribe({
      next: res => {
        if (res) {
          this.prodSyncResData = res;
        }
      }
    });
    this.newFileUploadSubs = this.skuDataSVC.newFileUpload$.subscribe({
      next: res => {
        if(res) {
          this.searchText = '';
        }
      }
    });
  }
  inputHandler(event: KeyboardEvent): void {
    // Show or hide clear button
    this.showClearButton = this.searchText.length > 0;
    //  enter key press logic
    if (event.key == 'Enter' && this.searchText.length > 0) {
      this.skuDataSVC.setProductSyncHistoryReq({ searchTerm: this.searchText });
    }
  }
  searchBtnClick() {
    if (this.searchText.length > 0) {
      this.skuDataSVC.setProductSyncHistoryReq({ searchTerm: this.searchText });
    }
  }
  clearInput(): void {
    this.searchText = '';
    this.showClearButton = false;
    this.skuDataSVC.setProductSyncHistoryReq({ searchTerm: this.searchText });
  }
  download() {
    this.skuUploadSVC.downloadHistory(this.prodSyncResData.batchId).subscribe({
      next: (res: HttpResponse<Blob>) => {        
        const blob = new Blob([res.body!], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Latest_History_${new Date().getTime()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    });
  }
  ngOnDestroy(): void {
    if(this.newFileUploadSubs) this.newFileUploadSubs.unsubscribe();
  }
}
