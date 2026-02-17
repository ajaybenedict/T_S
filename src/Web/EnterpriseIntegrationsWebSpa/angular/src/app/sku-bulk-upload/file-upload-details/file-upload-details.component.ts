import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { catchError, of, Subject, switchMap, takeUntil } from 'rxjs';
import { API_STATUS_FAILED, API_STATUS_NOT_STARTED, API_STATUS_SUCCESS, API_STATUS_WIP } from 'src/app/core/constants/constants';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { SkuUploadDataService } from 'src/app/core/services/sku-upload-data.service';
import { SkuUploadService } from 'src/app/core/services/sku-upload.service';
import { DialogType, PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { ProductSyncAPIRequest } from 'src/app/models/product-sync-history-api.model';
import { SKUUploadReqData } from 'src/app/models/sku-upload-response.model';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { v4 } from "uuid";
@Component({
  selector: 'app-file-upload-details',
  templateUrl: './file-upload-details.component.html',
  styleUrls: ['./file-upload-details.component.css']
})
export class FileUploadDetailsComponent {

  constructor(
    private skuUploadSVC: SkuUploadService,
    private skuDataSVC: SkuUploadDataService,
    private snackBarSVC: PpcSnackBarService,
  ) {}

  declare uploadedFileName: string | null;
  declare uploadedFile: File | null;  
  declare batchId: string;
  declare dialogRef: MatDialogRef<PpcDialogComponent>;
  readonly dialog = inject(MatDialog);

  cancelUploadFileSubject = new Subject<void>();
  // template reference variables - do not modify
  acceptableFileExtensions: string = '.csv';
  skuUploadInstructionText: string = 'Sku/Plan Sync';
  skuUploadInstructionSpan: string = '(CSV, Max file size of 2MB)';
  // Constants
  fileSizeError: string = 'Attached file size exceeds 2MB. Try again.';
  fileTypeError: string = 'Incorrect file type attached. Try again.';
  // Flags   
  isApiInitiated: boolean = false;
  storageAPIInProgress: boolean = false;
  storageAPIFailed: boolean = false;  
  disableUploadBtn: boolean = false;
  cancelBtnClicked: boolean = false;
  validationResult: { [key: string]: boolean } | null = null;

  @ViewChild('fileUpload', { static: false }) declare fileUploadElement: ElementRef<HTMLElement>;

  onFileSelected(event: Event) {    
    const element: HTMLInputElement = event.target as HTMLInputElement;
    const files: FileList | null = element.files;
    if (files && files.length > 0) {
      this.uploadedFileName = files[0].name;
      this.uploadedFile = files[0];
      this.validationResult = this.fileValidator();
      if (this.validationResult) {
        // show validation error dialog box here
        this.openDialog('ValidationError');
      } else {        
        this.openDialog('FileName');
      }
    }
    element.value = ''; // support re-upload of same file.
    this.resetAllFlags();
    this.skuDataSVC.setUploadSKUBatchAPIStatus(API_STATUS_NOT_STARTED); // to support next file upload after success/error response in uploadSKUBatch | For the status bar to hide
  }

  // Custom validation for file size and file type and file availability
  private fileValidator(): { [key: string]: boolean } | null {
    const file: File | null = this.uploadedFile;
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
      const isCSV = file.name.endsWith('.csv');

      if (file.size > maxSize) {
        return { 'fileSize': true };
      }
      if (!allowedTypes.includes(file.type) || !isCSV) {
        return { 'fileType': true };
      }
      return null;
    } else {
      return { 'fileAvailability': true };
    }
  }

  private openDialog(dialogType: DialogType) {
    let dialogData: PPCDialogData;
    const contentErrorMsg = this.validationResult?.['fileSize']
    ? 'Please try uploading a file that is smaller than 2MB as the attached file is larger than the permitted limit.'
    : 'You uploaded an incorrect type of file; only CSV files can be uploaded. Please select the appropriate file type.';
    const errorMsg = this.validationResult?.['fileSize']
    ? 'Attached file size exceeds 2MB. Try again.'
    : 'Incorrect file type attached. Try again.';

    if (dialogType === 'FileName') {
      if(this.cancelBtnClicked) {
        dialogData = {
          header: 'Cancel Upload',
          content: 'Are you sure? The upload procedure will be canceled.',
          type: 'FileName',
          primaryBtnName: 'Yes',
          primaryBtnAction: 'yes',
          secondaryBtnName: 'No',
          secondaryBtnAction: 'no',
          fileName: this.uploadedFileName ?? '',
        };
        this.cancelBtnClicked = false;
      } else {
        dialogData = {
          header: 'Confirmation',
          content: 'Do you really want to upload this data? Updates of data will happen instantly upon confirmation.',
          type: dialogType,
          fileName: this.uploadedFileName ?? '',
          primaryBtnName: 'Confirm',
          primaryBtnAction: 'confirm',
          secondaryBtnName: 'Cancel',
          secondaryBtnAction: 'cancel',
        };
      }      
    } else {
      dialogData = {
        header: 'Uploading Error',
        content: contentErrorMsg,
        type: dialogType,
        primaryBtnName: 'Try Again',
        primaryBtnAction: 'tryagain',
        secondaryBtnName: 'Cancel',
        secondaryBtnAction: 'cancel',
        loadErrorMsg: errorMsg,
      };
    }
    this.dialogRef = this.dialog.open(PpcDialogComponent, {
      data: dialogData,
      width: '480px',
      height: '324px',
    });

    this.dialogRef.afterClosed().subscribe({
      next: dialogResp => {
        if (dialogResp) {          
          switch (dialogResp) {
            case 'confirm': // change it to constants later
              this.isApiInitiated = true;
              this.fileUploadConfirmAPI();
              break;
            case 'tryagain':
              this.fileUploadElement.nativeElement.click();
              this.resetFileInput();
              break; 
            case 'yes':                            
              // Flag section - be cautious
              this.resetAllFlags();
              this.skuDataSVC.setStorageAPIStatus(API_STATUS_NOT_STARTED);

              this.fileUploadCancelAPI();              
              break;
            case 'no':
              // restart the API calls if user selects 'No'
              this.fileUploadConfirmAPI();
              break;
            default:
              break;
          }
        } else if(dialogResp === false && this.isApiInitiated) {
          // user clicked on 'X' icon - dialog emitted false and if storage API is in progress, we need to process API          
          this.fileUploadConfirmAPI();          
        }  else {
          // Do nothing for other cases
        }
      }
    });    
  }
  private fileUploadConfirmAPI() {
    if(this.uploadedFile) {
      this.skuDataSVC.setNewFileUpload(true);
      // Flag section - be cautious
      this.storageAPIInProgress = true;
      this.disableUploadBtn = true;
      this.skuDataSVC.setStorageAPIStatus(API_STATUS_WIP);
      
      this.batchId = v4(); // generates new GUID. This should not be called anywhere else.
      const formData = new FormData();
      formData.append('file', this.uploadedFile);
      formData.append('batchId', this.batchId);

      this.skuUploadSVC.uploadFileToStorage(formData).pipe(
        takeUntil(this.cancelUploadFileSubject), // To cancel API call        
        catchError(err => {
          // Flag section - be cautious
          this.storageAPIFailed = true;
          this.storageAPIInProgress = false;          
          this.disableUploadBtn = false;
          this.skuDataSVC.setStorageAPIStatus(API_STATUS_FAILED);
          this.skuDataSVC.setNewFileUpload(false);

          console.log('Error in processing upload storage API - ', err);
          return of(null);
        }),
        switchMap(res => {
          if(res) {
            // Flag section - be cautious
            this.storageAPIInProgress = false;
            this.isApiInitiated = false;
            this.skuDataSVC.setStorageAPIStatus(API_STATUS_SUCCESS);
            this.skuDataSVC.setUploadSKUBatchAPIStatus(API_STATUS_WIP);

            const dataToSend: SKUUploadReqData = {
              batchId: this.batchId,
            };
            return this.skuUploadSVC.uploadSKUBatch(dataToSend).pipe(
              catchError(err => {
                // Flag section - be cautious
                this.resetAllFlags();
                this.skuDataSVC.setUploadSKUBatchAPIStatus(API_STATUS_FAILED);
                this.skuDataSVC.setNewFileUpload(false);

                console.log('Error in Upload SKU batch API - ', err);
                return of(null);
              })
            );
          } else {
            return of(null);
          }
        }),
        switchMap(res => {
          if(res)  
          {            
            const dataToSend: ProductSyncAPIRequest = {
              IsSuccessHistory: false,
              searchTerm: '',
              pageNumber: 1,
              pageSize: 25
            };
            this.skuDataSVC.setProductSyncHistoryReq(dataToSend);
            return this.skuUploadSVC.productSyncHistory(dataToSend).pipe(
              catchError(err => {
                // Flag section - be cautious
                this.disableUploadBtn = false;
                this.skuDataSVC.setNewFileUpload(false);
                // setting it here as well to hide the overlay
                this.skuDataSVC.setUploadSKUBatchAPIStatus(API_STATUS_FAILED);                
                console.log('Error in productSyncHistory API - ', err);
                return of(null);
              })
            )
          } else {
            return of(null);
          }
        })    
      ).subscribe({
        next: res => {
          if(res) {
            // Flag section - be cautious
            this.resetAllFlags();
            this.skuDataSVC.setProductSyncHistoryRes(res);    
            this.skuDataSVC.setUploadSKUBatchAPIStatus(API_STATUS_SUCCESS); 

            this.snackBarSVC.show('"<span class="ppc-bold-txt">'+ this.uploadedFileName +'</span>" data has been uploaded.');
          }
        } 
      });
    }    
  }
  private fileUploadCancelAPI() {
    this.skuDataSVC.setNewFileUpload(false);
    this.skuUploadSVC.deleteFileFromStorage(this.batchId).subscribe({
      next: res => {                
        this.snackBarSVC.show('"<span class="ppc-bold-txt">'+ this.uploadedFileName +'</span>" - upload has been cancelled.');        
      }
    });
  }
  cancelUpload() {
    // Use case for  canceling the storage API - will cancel the existing API is progress              
    this.cancelUploadFileSubject.next();
    this.closeDialog();
    this.cancelBtnClicked = true;
    this.openDialog('FileName');    
  }
  closeDialog() {
    if(this.dialogRef) {
      this.dialogRef.close();
    }
  }
  private resetFileInput() {
    this.uploadedFile = null;
    this.uploadedFileName = null;
    this.validationResult = null;
  }
  private resetAllFlags() {    
    this.isApiInitiated = false;
    this.storageAPIInProgress = false;    
    this.storageAPIFailed = false;
    this.disableUploadBtn = false;
  }
}
