import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap, finalize, take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { S1DataTableColumn } from 'src/app/models/s1/s1-data-table.interface';
import { PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { DialogType } from 'src/app/models/ppc-dialog-data.model';
import { CloudToolsHelper } from '../cloud-tools-helper';
import { SubsTransferCustomerPreviewPanelData, SubsTransferCustomerPreviewRow } from 'src/app/models/cloud-tools/subs-transfer-preview.interface';
import { SubsTransferUploadRequest } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { SubsTransferUploadPanelComponent } from '../subs-transfer-upload-panel/subs-transfer-upload-panel.component';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { buildSubsTransferUploadPayload } from '../subs-transfer-form.helper';

@Component({
  selector: 'app-subs-transfer-customer-preview',
  templateUrl: './subs-transfer-customer-preview.component.html',
  styleUrls: ['./subs-transfer-customer-preview.component.css']
})
export class SubsTransferCustomerPreviewComponent implements OnInit, OnDestroy {

  readonly breadcrumbInput = 'Subscription Transfer$Customer Preview';
  readonly tableMaxHeight = 'calc(100vh - 396px)';
  readonly pageSizeOptions = [10, 25, 50, 75, 100];
  
  columnData!: S1DataTableColumn[];
  tableData: SubsTransferCustomerPreviewRow[] = [];
  displayedTableData: SubsTransferCustomerPreviewRow[] = [];
  showLoadingOverlay = false;
  paginatorData!: PPCPaginatorData;

  private dialogRef?: MatDialogRef<PpcDialogComponent>;
  private readonly destroy$ = new Subject<void>();
  private allCustomerData: SubsTransferCustomerPreviewRow[] = [];

  constructor(    
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<SubsTransferCustomerPreviewPanelData>,
    @Inject(SIDE_PANEL_DATA) private readonly data: SubsTransferCustomerPreviewPanelData,
    private readonly paginatorDataSVC: PpcPaginatorDataService,
    private readonly dialog: MatDialog,
    private readonly sidePanelService: SidePanelService,
    private readonly cloudToolsAPIService: CloudToolsAPIService,
    private readonly snackbarService: PpcSnackBarService,
  ) { }

  ngOnInit(): void {
    this.initTableColumn();
    this.initTableData();
    this.initPaginatorData();
    this.subscribeToPageChanges();
  }

  initTableColumn() {
    this.columnData = CloudToolsHelper.getSubsTransferCustomerPreviewColumns();
  }

  initTableData() {
    this.allCustomerData = this.data?.rows ?? [];
    this.tableData = this.allCustomerData;
  }

  initPaginatorData() {
    this.paginatorData = {
      page: 1,
      pageSize: 10,
      total: this.allCustomerData.length,
      pageSizeOption: this.pageSizeOptions,
    };
    this.paginatorDataSVC.setPPCPaginatorData(this.paginatorData);
    this.filterTableData();
  }

  private subscribeToPageChanges() {
    this.paginatorDataSVC.ppcPageChangeEventData$
      .pipe(
        takeUntil(this.destroy$),
        tap((pageChangeEvent) => {
          if (pageChangeEvent) {            
            this.showLoadingOverlay = true;
          }
        })
      )
      .subscribe({
        next: (pageChangeEvent) => {
          if (pageChangeEvent) {
            this.filterTableData(pageChangeEvent.page, pageChangeEvent.pageSize);
            this.showLoadingOverlay = false;
          }
        }
      });
  }

  private filterTableData(page: number = 1, pageSize: number = 10) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    this.displayedTableData = this.allCustomerData.slice(startIndex, endIndex);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.paginatorDataSVC.setPPCPaginatorData(null);
    this.paginatorDataSVC.setPPCPageChangeEventData(null);
  }

  showDialog() {
    this.openDialog('SubsTransferCustomerPreviewConfirmation');
  }

  private openDialog(
    type: Extract<DialogType, 'SubsTransferCustomerPreviewConfirmation'>
  ) {
    this.closeDialog();
    const data = CloudToolsHelper.getPpcDialogData(type);
    this.dialogRef = this.dialog.open(PpcDialogComponent, {
      height: '317px',
      width: '75vw',
      maxWidth: '75vw',
      disableClose: false,
      position: { bottom: '0', right: '0' },
      data,
    });

    this.dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((dialogResult: string | boolean | undefined) => {
        if (dialogResult === 'confirm') {
          this.handleConfirmAction();
        }
      });
  }

  private closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private handleConfirmAction(): void {
    const payload = this.buildSubsTransferUploadPayload();
    if (!payload) {
      console.warn('Subscription transfer payload is incomplete or invalid');
      this.navigateBackToUploadPanel();
      return;
    }

    this.showLoadingOverlay = true;

    this.cloudToolsAPIService.subsTransferUpload(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.showLoadingOverlay = false;
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.status === 202) {
            this.showSuccessSnackbar();
            this.panelRef.close();
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error uploading file in subscription transfer - ', err);
          const errorMsg = this.getErrorMessage(new HttpErrorResponse({ error: 'Error uploading file in subscription transfer. Please try again later.' }));
          this.navigateBackToUploadPanelWithError(errorMsg);
        },
      });
  }

  private buildSubsTransferUploadPayload(): SubsTransferUploadRequest | null {
    return buildSubsTransferUploadPayload(this.data?.formValues);
  }

  private showSuccessSnackbar(): void {
    const successMsg = 'Subscription transfer confirmed and uploaded successfully.';
    this.snackbarService.show(successMsg, 5000);
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 500) {
      return 'Something went wrong. Please try again later.';
    }

    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }

    const message = err.error?.message ?? err.message;
    return message || 'Failed to upload subscription transfer. Please try again later.';
  }

  private navigateBackToUploadPanel(): void {
    this.sidePanelService.open(
      SubsTransferUploadPanelComponent,
      {
        disableClose: true,
        hasBackdrop: false,
        width: '375px',
        position: 'right',
        data: {
          type: 'SubscriptionTransfer',
          subsTransferFormValues: this.data.formValues,
        },
        layoutMode: 'below-header',
        headerHeightPx: 68,
      },
    );
  }

  private navigateBackToUploadPanelWithError(errorMsg: string): void {
    // Pass error message through data service or side panel data
    this.sidePanelService.open(
      SubsTransferUploadPanelComponent,
      {
        disableClose: true,
        hasBackdrop: false,
        width: '375px',
        position: 'right',
        data: {
          type: 'SubscriptionTransfer',
          subsTransferFormValues: this.data.formValues,
          uploadError: errorMsg,
        },
        layoutMode: 'below-header',
        headerHeightPx: 68,
      },
    );
  }

  closeHandler() {
    this.navigateBackToUploadPanel();
  }
}
