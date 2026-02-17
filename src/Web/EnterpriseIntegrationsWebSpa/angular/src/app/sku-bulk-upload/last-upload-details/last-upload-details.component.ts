import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SkuUploadDataService } from 'src/app/core/services/sku-upload-data.service';
import { SkuUploadService } from 'src/app/core/services/sku-upload.service';
import { ProductSyncAPIResponse } from 'src/app/models/product-sync-history-api.model';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-last-upload-details',
  templateUrl: './last-upload-details.component.html',
  styleUrls: ['./last-upload-details.component.css']
})
export class LastUploadDetailsComponent implements OnInit, OnDestroy {
  // Title constants
  fileTitle: string = 'File:';
  userNameTitle: string = 'Name:';
  dtStampTitle: string = 'Date & Time:';
  resultTitle: string = 'Result:';
  // value vars
  declare fileValue: string;
  declare userNameValue: string;
  declare dtStampValue: string;
  declare totalUploads: string;
  declare successUploads: string;
  declare errorUploads: string;
  
  declare productSyncHistoryData: ProductSyncAPIResponse
  declare skuDataSubs: Subscription;

  constructor(
    private skuDataSVC: SkuUploadDataService,
    private skuUploadSVC: SkuUploadService,
  ) {}
  ngOnInit(): void {
    this.skuDataSubs = this.skuDataSVC.productSyncHistoryRes$.subscribe({
      next: (res) => {
        if(res){
          this.productSyncHistoryData = res;
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;          
          this.dtStampValue = moment(res.logCreateTime).tz(userTimeZone).format('DD-MMM-YYYY | hh:mm A');
          this.fileValue = res.fileName;
          this.userNameValue = res.userName;          
          this.totalUploads = res.totalCount.toString();
          this.successUploads = res.totalSuccess.toString();
          this.errorUploads = res.totalError.toString();
        }        
      }
    });
  }
  download(event: boolean) {
    if(event) {
      this.skuUploadSVC.downloadFile(this.productSyncHistoryData.batchId).subscribe({
        next: (res: HttpResponse<Blob>) => {        
          const blob = new Blob([res.body!], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Latest_File_${new Date().getTime()}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      });
    }
  }
  ngOnDestroy(): void {
    if(this.skuDataSubs) {
      this.skuDataSubs.unsubscribe();
    }
  }
}
