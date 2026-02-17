import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SkuUploadService } from '../core/services/sku-upload.service';
import { DialogType, PPCDialogData } from '../models/ppc-dialog-data.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductSyncAPIRequest } from '../models/product-sync-history-api.model';
import { PpcDialogComponent } from '../shared/ppc-dialog/ppc-dialog.component';
import { SkuUploadDataService } from '../core/services/sku-upload-data.service';
import { Subscription } from 'rxjs';
import { PPCStatusBarData } from '../models/ppc-status-bar.model';
import { API_STATUS_FAILED, API_STATUS_WIP } from '../core/constants/constants';
import { DataState } from '../core/services/data-state';
@Component({
  selector: 'app-sku-bulk-upload',
  templateUrl: './sku-bulk-upload.component.html',
  styleUrls: ['./sku-bulk-upload.component.css']
})
export class SkuBulkUploadComponent implements OnInit, OnDestroy {

  readonly dialog = inject(MatDialog);
  declare productHistoryDataSubs: Subscription;
  declare dialogRef: MatDialogRef<PpcDialogComponent>;
  declare uploadAPIStatusSubs: Subscription;
  declare authSubs: Subscription;

  showStatusBar: boolean = false;
  uploadAPIFailed: boolean = false;
  uploadAPIInProgress: boolean = false;
  isAuthError: boolean = false;
  statusBarErrorMsg: string = "<span class='ppc-bold-txt'>Last upload failed.&nbsp;</span> Please try again uploading the file.";
  statusBarAlertMsg: string = "<span class='ppc-bold-txt'>Last upload is in progress.&nbsp;</span>The page will update automatically momentarily."

  // Constants
  statusBarData: PPCStatusBarData = {
    height: '64px',
    type: 'alert',
    showDismissBtn: true,
    message: '',
  }

  constructor(
    private skuUploadSVC: SkuUploadService,
    private skuUploadDataSVC: SkuUploadDataService,
    private dataSVC: DataState,  // Later move the auth logic to skudatasvc      
  ) { }

  ngOnInit(): void {
    this.openDialog('Loader');
    this.skuUploadDataSVC.setIsInitialProductSyncCall(true);
    this.getProductSyncHistory();
    this.uploadAPIStatusSubs = this.skuUploadDataSVC.uploadSKUBatchAPIStatus$.subscribe({
      next: res => {
        if (res) {
          if (res === API_STATUS_WIP) {
            this.statusBarData.message = this.statusBarAlertMsg;
            this.statusBarData.type = 'alert';
            this.statusBarData.showDismissBtn = false;
            this.showStatusBar = true;
          } else if (res === API_STATUS_FAILED) {
            this.statusBarData.message = this.statusBarErrorMsg;
            this.statusBarData.type = 'error';
            this.statusBarData.showDismissBtn = true;
            this.showStatusBar = true;
          } else {
            this.showStatusBar = false;
          }
        } else {
          this.showStatusBar = false;
        }
      }
    });
    this.authSubs = this.skuUploadDataSVC.isSKUAuthError$.subscribe({
      next: res => {
        this.isAuthError = res;
        if (this.isAuthError) {
          this.closeDialog();
          this.openDialog('LoadError');
        }
      },
    });
  }

  statusBarDismissHandler(event: boolean) {
    this.showStatusBar = !event;
  }
  getProductSyncHistory() {
    const data: ProductSyncAPIRequest = {
      IsSuccessHistory: false,
      pageNumber: 1,
      pageSize: 25,
      searchTerm: '',
    };
    this.skuUploadSVC.productSyncHistory(data).subscribe({
      next: (res) => {
        // Pass this res to data service
        this.skuUploadDataSVC.setProductSyncHistoryRes(res);
        this.closeDialog();
      },
      error: (err) => {
        // call load error dialog. close if a dialog is in open
        this.closeDialog();
        this.openDialog('LoadError');
      }
    });
  }

  openDialog(type: DialogType) {
    let dialogData: { width: string, height: string, data: PPCDialogData };
    if (type == 'Loader') {
      let data: PPCDialogData = {
        content: 'Please wait a few moments for the last upload data to sync.',
        loadingText: 'Syncing',
        type: 'Loader',
      }
      dialogData = {
        width: '480px',
        height: '152px',
        data,
      };
    }
    else if (this.isAuthError) {
      // Loader error type dialog with Auth Error
      this.closeDialog();
      let data: PPCDialogData = {
        content: 'You do not have permission to perform this action. Please contact your administrator for assistance.',
        type: 'LoadError',
        loadErrorMsg: '<span class="ppc-bold-txt">Authorization Error</span>',
      };
      dialogData = {
        width: '480px',
        height: '152px',
        data,
      }

    } else {
      // Loader Error type dialog with load error
      let data: PPCDialogData = {
        content: 'The data sync from the last upload failed. Please try again.',
        loadErrorMsg: 'Sync failed. Try again',
        primaryBtnAction: 'TryAgain',
        primaryBtnName: 'Try Again',
        type: 'LoadError',
      };
      dialogData = {
        width: '480px',
        height: '228px',
        data,
      };
    }


    this.dialogRef = this.dialog.open(PpcDialogComponent, dialogData);
    this.dialogRef.afterClosed().subscribe(res => {
      if (res && res == 'TryAgain') {
        this.getProductSyncHistory();
        this.openDialog('Loader');
      }
    });
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    if (this.productHistoryDataSubs) {
      this.productHistoryDataSubs.unsubscribe();
    }
    if (this.uploadAPIStatusSubs) {
      this.uploadAPIStatusSubs.unsubscribe();
    }
    if (this.authSubs) {
      this.authSubs.unsubscribe();
    }
  }
}

