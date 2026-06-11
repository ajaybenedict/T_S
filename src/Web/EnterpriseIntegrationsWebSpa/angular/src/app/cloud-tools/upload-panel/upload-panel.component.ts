import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { take } from 'rxjs';
import { CloudTools, uploadButtonData } from 'src/app/core/config/cloud-tools.config';
import { CLOUD_TOOLS_CONFIRMATION_DIALOG, CLOUD_TOOLS_UPLOAD_WARNING } from 'src/app/core/constants/constants';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { SubsTransferFormValues } from 'src/app/models/cloud-tools/subs-transfer-preview.interface';
import { CloudToolsHelper } from '../cloud-tools-helper';

export interface PanelData {
  readonly type: CloudTools;
  readonly subsTransferFormValues?: SubsTransferFormValues;
  readonly uploadError?: string;
}

@Component({
  selector: 'app-upload-panel',
  templateUrl: './upload-panel.component.html',
  styleUrls: ['./upload-panel.component.css']
})
export class UploadPanelComponent implements OnInit, OnChanges{

  selectedFile: File | null = null;
  requestedBy = '';
  clearFileTrigger = 0;
  uploadErrors: string[] = [];
  isButtonValid: boolean = false;
  showOverlay = false;
  showConfirmDialog = false;

  header = CLOUD_TOOLS_CONFIRMATION_DIALOG.DEFAULT_HEADER;
  content = CLOUD_TOOLS_CONFIRMATION_DIALOG.UPLOAD_CONTENT;
  warningMessage = CLOUD_TOOLS_UPLOAD_WARNING.MSG;
  panelTitle!: string;
  uploadAPIURL!: string;
  uploadTemplateURL!: string;
  btnConfig = uploadButtonData;

  constructor(
    private readonly cloudToolsAPISVC: CloudToolsAPIService,
    private readonly cloudToolsDataSVC: CloudToolsDataService,
    private readonly snackbarService: PpcSnackBarService,
    @Inject(SIDE_PANEL_DATA) public readonly data: PanelData,
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<PanelData>
  ) {}

  ngOnInit(): void {    
    if(this.data.type) {
      this.initPanelData();
      this.reset();
      // Handle error passed from preview panel
      if (this.data.uploadError) {
        this.uploadErrors.push(this.data.uploadError);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['type'] && this.data.type) {
      this.initPanelData();
    }
  }

  initPanelData() {
    this.panelTitle = this.btnConfig[this.data.type].display;
    this.uploadAPIURL = this.btnConfig[this.data.type].uploadAPIURL;
    this.uploadTemplateURL = this.btnConfig[this.data.type].uploadTemplateURL;
  }

  onFileError(errorMessage: string | null): void {
    if (!errorMessage) {
      this.uploadErrors = [];
      return;
    }
    this.isButtonValid = false;
    this.uploadErrors.push(errorMessage);
  }


  closeHandler() {
    this.reset();    
    if(this.panelRef) this.panelRef.close();
  }

  onFileReceived(file: File | null) {
    this.selectedFile = file;
    this.updateButtonValidity();
  }

  onRequestedByChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const sanitizedValue = this.normalizeRequestedByValue(target?.value ?? '');
    
    // Update the input if sanitization removed characters
    if (target && sanitizedValue !== target.value) {
      target.value = sanitizedValue;
    }
    
    this.requestedBy = sanitizedValue;
    this.updateButtonValidity();
  }

  onRequestedByPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? selectionStart;
    const currentValue = target.value;
    const sanitizedPastedText = CloudToolsHelper.sanitizeFilenameString(event.clipboardData?.getData('text') ?? '');
    const availableLength = Math.max(0, 100 - (currentValue.length - (selectionEnd - selectionStart)));
    const truncatedPastedText = sanitizedPastedText.slice(0, availableLength);

    if (typeof target.setRangeText === 'function') {
      target.setRangeText(truncatedPastedText, selectionStart, selectionEnd, 'end');
    } else {
      target.value = `${currentValue.slice(0, selectionStart)}${truncatedPastedText}${currentValue.slice(selectionEnd)}`;
    }

    const sanitizedValue = this.normalizeRequestedByValue(target.value);
    if (sanitizedValue !== target.value) {
      target.value = sanitizedValue;
    }

    this.requestedBy = sanitizedValue;

    this.updateButtonValidity();
  }

  onCancel() {
    this.showConfirmDialog = false;
  }

  onConfirm() {
    this.cloudToolsDataSVC.setUploadAPIState('InProgress');
    this.showOverlay = true;
    this.showConfirmDialog = false;
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('requestedBy', this.requestedBy.trim());

    this.cloudToolsAPISVC.uploadFileToCloudTools(formData, this.uploadAPIURL).pipe(
      take(1),
    ).subscribe({
      next: res => {
        if(res.status == 202) {
          this.cloudToolsDataSVC.setUploadAPIState('Success');
          this.showSuccessSnackbar();
          this.showOverlay = false;
          this.reset();
          this.clearFileTrigger++;
          this.panelRef.close();
        }
        // Handle other state codes/error codes if required.
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error in Upload API - ', err);
        this.cloudToolsDataSVC.setUploadAPIState('Failed');
        this.showOverlay = false;
        this.reset();
        this.clearFileTrigger++;
        let errMsg = '';
        if(err.status === 500) {
          errMsg = 'Something went wrong. Please try again later.'
        } else {
          errMsg = err.error?.message ?? err.message;
        }
        this.uploadErrors = [errMsg];
      },
    });
  }

  processFile() {
    this.showConfirmDialog = true;
  }

  reset() {
    this.isButtonValid = false;
    this.selectedFile = null;
    this.requestedBy = '';
    this.uploadErrors = [];
    this.clearFileTrigger++;
  }

  private updateButtonValidity(): void {
    this.isButtonValid = !!this.selectedFile && !!this.requestedBy.trim();
  }

  private showSuccessSnackbar(): void {
    const successMsg = 'File has been uploaded successfully.';
    this.snackbarService.show(successMsg, 5000);
  }

  private normalizeRequestedByValue(value: string): string {
    return CloudToolsHelper.sanitizeFilenameString(value).slice(0, 100);
  }

  downloadTemplate() {
    const fileName = 'template.csv';

    const link = document.createElement('a');
    link.href = this.uploadTemplateURL;
    link.download = fileName;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
