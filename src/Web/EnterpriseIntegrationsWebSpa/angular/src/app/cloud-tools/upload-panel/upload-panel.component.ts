import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { take } from 'rxjs';
import { CloudTools, uploadButtonData } from 'src/app/core/config/cloud-tools.config';
import { CLOUD_TOOLS_CONFIRMATION_DIALOG, CLOUD_TOOLS_UPLOAD_WARNING } from 'src/app/core/constants/constants';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';

export interface PanelData {
  readonly type: CloudTools;
}

@Component({
  selector: 'app-upload-panel',
  templateUrl: './upload-panel.component.html',
  styleUrls: ['./upload-panel.component.css']
})
export class UploadPanelComponent implements OnInit, OnChanges{

  selectedFile: File | null = null;
  clearFileTrigger = 0;
  uploadErrors: string[] = [];
  isButtonValid: boolean = false;
  showOverlay = false;
  showConfirmDialog = false;

  header = CLOUD_TOOLS_CONFIRMATION_DIALOG.DEFAAULT_HEADER;
  content = CLOUD_TOOLS_CONFIRMATION_DIALOG.UPLOAD_CONTENT;
  warningMessage = CLOUD_TOOLS_UPLOAD_WARNING.MSG;
  panelTitle!: string;
  uploadAPIURL!: string;
  uploadTemplateURL!: string;
  btnConfig = uploadButtonData;

  constructor(
    private readonly cloudToolsAPISVC: CloudToolsAPIService,
    private readonly cloudToolsDataSVC: CloudToolsDataService,
    @Inject(SIDE_PANEL_DATA) public readonly data: PanelData,
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<PanelData>
  ) {}

  ngOnInit(): void {    
    if(this.data.type) {
      this.initPanelData();
      this.reset();
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
    this.isButtonValid = !!file;
    this.selectedFile = file;
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

    this.cloudToolsAPISVC.uploadFileToCloudTools(formData, this.uploadAPIURL).pipe(
      take(1),
    ).subscribe({
      next: res => {
        if(res.status == 202) {
          this.cloudToolsDataSVC.setUploadAPIState('Success');
          this.showOverlay = false;
          this.reset();
          this.clearFileTrigger++;          
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
    this.uploadErrors = [];
    this.clearFileTrigger++;
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
