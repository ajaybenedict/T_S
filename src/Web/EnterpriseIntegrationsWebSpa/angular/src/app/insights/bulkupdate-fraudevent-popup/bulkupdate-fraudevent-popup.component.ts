import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BulkUpdateEventStatusConfig, resolvedReasonConfig, FRAUD_EVENT_COLUMN_MAPPING, eventStatusConfig } from 'src/app/core/config/fraud-alert-event.config';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { S1DataTableColumn } from 'src/app/models/s1/s1-data-table.interface';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_REF, SIDE_PANEL_DATA } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { DialogType, PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { VendorService } from 'src/app/core/services/vendor/vendor.service';
import { BulkUpdateFraudEventRequest, BulkUpdateFraudEventResponseItem } from 'src/app/models/insights/insights-dashboard-api-response.interface';
import { UpdateFraudEventStatusRequest } from 'src/app/models/vendor/vendor-api.models';
import { Subject, takeUntil } from 'rxjs';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { BULK_UPDATE_COLUMN, EVENT_TIME_COLUMN_NAME, EVENT_TIME_FILTER_TYPE } from 'src/app/core/constants/constants';

interface PanelData {
  readonly requestBody?: unknown;
  readonly slicerFilters?: any[];
}

@Component({
  selector: 'app-bulkupdate-fraudevent-popup',
  templateUrl: './bulkupdate-fraudevent-popup.component.html',
  styleUrls: ['./bulkupdate-fraudevent-popup.component.css']
})
export class BulkupdateFraudeventPopupComponent implements OnInit, OnDestroy {
  readonly tableMaxHeight = 'calc(100vh - 500px)';
  readonly pageSizeOptions = [50, 75, 100];
  eventStatus: string = '';

  fraudAlertForm!: FormGroup;
  eventStatusDropdown: SelectDropdown[] = BulkUpdateEventStatusConfig.map(el => ({ label: el, value: el }));
  resolvedReasonDropdown: SelectDropdown[] = resolvedReasonConfig.map(el => ({ label: el, value: el }));

  tablecolumns: S1DataTableColumn[] = [
    {
      displayName: 'Region',
      columnKey: 'Region',
      key: 'countrySecurityKey',
      isSortable: false,
      columnWidth: '10%',
      columnType: 'text',
      headerAlignment: 'start',
      cellAlignment: 'start',
      columnID: 1
    },
    {
      displayName: 'Event ID',
      columnKey: 'EventID',
      key: 'eventId',
      isSortable: false,
      columnWidth: '50%',
      columnType: 'text',
      headerAlignment: 'start',
      cellAlignment: 'start',
      columnID: 0,
    },
    {
      displayName: 'Sub ID',
      columnKey: 'SubID',
      key: 'subscriptionId',
      isSortable: false,
      columnWidth: '40%',
      columnType: 'text',
      headerAlignment: 'start',
      cellAlignment: 'start',
      columnID: 2,
    },
  ];

  publishedTableData: BulkUpdateFraudEventResponseItem[] = [];
  showTableProgressBar = false;
  selectedEventsCount = '0';
  paginatorData!: PPCPaginatorData;
  private dialogRef?: MatDialogRef<PpcDialogComponent>;
  private readonly destroy$ = new Subject<void>();

  formControlList = {
    EVENT_STATUS: 'eventStatus',
    RESOLVED_REASON: 'resolvedReason',
  };

  constructor(
    private readonly fb: FormBuilder,
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<PanelData>,
    private readonly paginatorDataSVC: PpcPaginatorDataService,
    private readonly dialog: MatDialog,
    private readonly vendorSVC: VendorService,
    @Inject(SIDE_PANEL_DATA) public data: PanelData, 
    private readonly snackbarService: PpcSnackBarService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initPaginator();
    this.listenEventStatusChange();
    this.filterEventStatusDropdown();
  }

  /**
   * Initializes the form with event status and resolved reason controls
   */
  private initForm() {
    this.fraudAlertForm = this.fb.group({
      [this.formControlList.EVENT_STATUS]: ['', Validators.required],
      [this.formControlList.RESOLVED_REASON]: ['']
    });
  }

  /**
   * Sets up listeners for event status changes to dynamically update resolved reason validation
   */
  private listenEventStatusChange() {
    const statusControl = this.fraudAlertForm.get(this.formControlList.EVENT_STATUS);
    const resolvedReasonControl = this.fraudAlertForm.get(this.formControlList.RESOLVED_REASON);

    statusControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.eventStatus = status.value;
      if (status?.value === 'Resolved') {
        resolvedReasonControl?.setValidators([Validators.required]);
      } else {
        resolvedReasonControl?.clearValidators();
        resolvedReasonControl?.setValue(null);
      }
      resolvedReasonControl?.updateValueAndValidity();
    });
  }

  /**
   * Filters the event status dropdown options based on the current slicer filter selection
   */
  private filterEventStatusDropdown() {
    const eventStatusFilter = this.data.slicerFilters?.find((f: any) => f.target?.column === BULK_UPDATE_COLUMN);
    if (eventStatusFilter?.values?.length !== 1) return;

    const currentStatus = eventStatusFilter.values[0];
    if (currentStatus === eventStatusConfig[0]) {
      this.eventStatusDropdown = this.eventStatusDropdown.filter(d => d.value === BulkUpdateEventStatusConfig[0] || d.value === BulkUpdateEventStatusConfig[1]);
    } else if (currentStatus === BulkUpdateEventStatusConfig[0]) {
      this.eventStatusDropdown = this.eventStatusDropdown.filter(d => d.value === BulkUpdateEventStatusConfig[1]);
    }
    // For other statuses, keep all options
  }

  /**
   * Initializes the paginator with default values and sets up page change subscriptions
   * @param totalRows - Optional total number of rows for pagination
   */
  private initPaginator(totalRows?: number) {
    this.paginatorData = {
      page: 0,
      pageSize: 50,
      total: totalRows ?? 0,
      pageSizeOption: this.pageSizeOptions
    };
    this.paginatorDataSVC.setPPCPaginatorData(this.paginatorData);

    this.paginatorDataSVC.ppcPageChangeEventData$.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event) this.loadTableData(event.page, event.pageSize);
    });
  }

  /**
   * Loads table data for the specified page and page size
   * @param page - The page number to load
   * @param pageSize - The number of items per page
   */
  private loadTableData(page = 0, pageSize = 50) {
    let requestBody = this.data.requestBody ?? this.buildFraudEventsRequest(this.data);
    if (!requestBody) return;

    const typedRequestBody = requestBody as BulkUpdateFraudEventRequest;
    typedRequestBody.pageNumber = page;
    typedRequestBody.pageSize = pageSize;

    this.showTableProgressBar = true;
    this.vendorSVC.getFraudEvents(typedRequestBody).subscribe({
      next: res => {
        this.publishedTableData = res.items;
        this.selectedEventsCount = String(res.totalRows);
        this.paginatorData.total = res.totalRows;
        this.paginatorDataSVC.setPPCPaginatorData(this.paginatorData);
        this.showTableProgressBar = false;
      },
      error: err => {
        console.error('Failed to load fraud events:', err);
        this.showTableProgressBar = false;
      }
    });

  }



  /**
   * Builds the fraud events request body from the provided context
   * @param context - The context containing slicer filters and request body
   * @returns The constructed BulkUpdateFraudEventRequest or null if context is invalid
   */
  private buildFraudEventsRequest(context: any) {
    if (!context) return null;
    const body: BulkUpdateFraudEventRequest = {
      eventTime: [],
      severity: [], pac: [], region: [], country: [], eventStatus: [], reseller: [], customer: [], confidenceLevel: [], eventType: [],
      pageNumber: 0, pageSize: 0
    };
    const eventTimeFilter = context.slicerFilters?.find((f: any) => f.filterType === EVENT_TIME_FILTER_TYPE && f.target?.column === EVENT_TIME_COLUMN_NAME);
    if (eventTimeFilter) {
      const { startDate, endDate } = this.getRelativeDateRange(eventTimeFilter);
      body.eventTime = [startDate, endDate];
    }
  
    context.slicerFilters?.forEach((filter: any) => {
      const key = FRAUD_EVENT_COLUMN_MAPPING[filter.target?.column];
      if (key) (body as Record<string, any>)[key] = filter.values ?? [];
    });

    return body;
  }

  /**
   * Calculates relative date range based on the filter configuration
   * @param filter - The time filter configuration
   * @returns Object containing startDate and endDate strings
   */
  private getRelativeDateRange(filter: any) {
    const today = new Date();
    let startDate = new Date(today), endDate = new Date(today);
    const count = filter.timeUnitsCount;

    switch (filter.timeUnitType) {
      case 0: startDate.setDate(today.getDate() - (count - 1)); break; // Days
      case 1: startDate.setDate(today.getDate() - (7 * count - 1)); break; // Weeks
      case 2: {
        const dayOfWeek = today.getDay();
        endDate.setDate(today.getDate() - dayOfWeek - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6 - 7 * (count - 1));
        break;
      }
      case 3: startDate = new Date(today.getFullYear(), today.getMonth() - count, today.getDate() + 1); break; // Months
      case 4: startDate = new Date(today.getFullYear(), today.getMonth() - count, 1); endDate = new Date(today.getFullYear(), today.getMonth() - count + 1, 0); break; // Full months
      case 5: startDate = new Date(today.getFullYear() - count, today.getMonth(), today.getDate() + 1); break; // Years
      case 6: startDate = new Date(today.getFullYear() - count, 0, 1); endDate = new Date(today.getFullYear() - 1, 11, 31); break; // Full years
    }

    return { startDate: this.formatDate(startDate), endDate: this.formatDate(endDate) };
  }

  /**
   * Formats a Date object to YYYY-MM-DD string format
   * @param date - The date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * Shows the bulk update confirmation dialog
   */
  showDialog() { this.openDialog('BulkUpdateFraudEventConfirmation'); }

  /**
   * Opens a dialog with the specified type and handles the response
   * @param type - The type of dialog to open
   */
  private openDialog(type: DialogType) {
    this.dialogRef?.close();
    const dialogData: PPCDialogData = {
      type,
      header: 'Confirmation',
      content: `Are you sure want to update <span class='ppc-bold-txt'>${this.selectedEventsCount}</span> events?`,
      primaryBtnAction: 'Update',
      secondaryBtnAction: 'Cancel',
      primaryBtnName: 'Update',
      secondaryBtnName: 'Cancel'
    };
    this.dialogRef = this.dialog.open(PpcDialogComponent, {
      width: '75vw', height: '240px', data: dialogData, maxWidth: '75vw', disableClose: false, position: { bottom: '0', right: '0' }
    });
    this.dialogRef.afterClosed().subscribe(res => {
      if (res === 'Update') {
        this.performBulkUpdate();
      }
    });
  }


  /**
   * Performs the bulk update operation for fraud events
   * Fetches all events and updates their status and resolved reason
   */
  private performBulkUpdate(): void {
    const formValues = this.fraudAlertForm.value;

    const eventStatus =
      formValues[this.formControlList.EVENT_STATUS]?.value ||
      formValues[this.formControlList.EVENT_STATUS];

    const resolvedReason =
      formValues[this.formControlList.RESOLVED_REASON]?.value ||
      formValues[this.formControlList.RESOLVED_REASON] ||
      '';

    let requestBody = this.data.requestBody ?? this.buildFraudEventsRequest(this.data);
    if (!requestBody) return;

    const typedRequestBody = requestBody as BulkUpdateFraudEventRequest;
    typedRequestBody.pageNumber = 1;
    typedRequestBody.pageSize = Number(this.selectedEventsCount);
    this.showTableProgressBar = true;

    this.vendorSVC.getFraudEvents(typedRequestBody).subscribe({
      next: res => {
        const allEvents = res?.items ?? [];

        const bulkUpdateRequests: UpdateFraudEventStatusRequest[] =
          allEvents.map((event: any) => ({
            eventIds: event.eventId,
            eventStatus: eventStatus,
            resolvedReason: resolvedReason,
            SubscriptionId: event.subscriptionId,
            Region: event.countrySecurityKey,
            OldResolvedReason: event.resolvedReason || '',
            OldEventStatus: event.eventStatus,
            VendorId: Number(event.vendorId)
          }));               
          this.vendorSVC.bulkUpdateFraudEventStatus(bulkUpdateRequests).subscribe({
            next: (response) => {             
              this.showSuccessSnackbar();
              this.closeHandler();
              this.showTableProgressBar = false;
            },
            error: (error) => {            
              this.showErrorSnackbar();
              this.showTableProgressBar = false;
            }
          });
      },
      error: err => {
        console.error('Failed to fetch all events:', err);
        this.showTableProgressBar = false;
      }
    });
  }
  /**
   * Shows a success snackbar message for successful bulk update
   */
  private showSuccessSnackbar(): void {
    const successMsg = 'Fraud events updated successfully.';
    this.snackbarService.show(successMsg, 5000);
  }

  /**
   * Shows an error snackbar message for failed bulk update
   */
  private showErrorSnackbar(): void {
    const errorMsg = 'Failed to update fraud events.';
    this.snackbarService.show(errorMsg, 5000);
  }


  /**
   * Closes the side panel
   */
  closeHandler() { this.panelRef.close(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}