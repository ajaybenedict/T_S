import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { CloudToolsHelper } from '../cloud-tools-helper';
import { S1DataTableColumn } from 'src/app/models/s1/s1-data-table.interface';
import { S1SearchBar } from 'src/app/models/s1/s1-search-bar.interface';
import { DatePipe } from '@angular/common';
import { CloudTools, CLOUD_TOOLS_PERMISSION_MAP, DashboardTabEnum } from 'src/app/core/config/cloud-tools.config';
import { CloudToolsStatusIdEnum, CloudToolsTaskIdEnum, TransactionDetailsRequest, TransactionDetailsResponse, TransactionRequest, TransactionResponse, Transactions } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { Subject, take, takeUntil } from 'rxjs';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { PPCPageChangeEventData, PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { CLOUD_TOOLS_ROUTE, DEFAULT_PAGE_SIZE_CLOUD_TOOLS, DEFAULT_PAGE_SIZE_OPTIONS } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { ApplicationIdEnum, PermissionsEnum } from 'src/app/core/config/permissions.config';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { UploadPanelComponent } from '../upload-panel/upload-panel.component';
import { SubsTransferUploadPanelComponent } from '../subs-transfer-upload-panel/subs-transfer-upload-panel.component';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';
import { ActivatedRoute } from '@angular/router';

const ALLOWED_TOOL_PERMISSION_SET = new Set(Object.values(CLOUD_TOOLS_PERMISSION_MAP));

@Component({
  selector: 'app-cloud-tools-dashboard',
  templateUrl: './cloud-tools-dashboard.component.html',
  styleUrls: ['./cloud-tools-dashboard.component.css'],
  providers: [PpcPaginatorDataService],

})
export class CloudToolsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  isPaginatorVisible = false;
  showTableProgressBar = false;
  showOverlay = false;
  isCardDetailsVisible = false;
  isTransactionDetailsAPIInProgress = false;
  showFilterControls = true;

  navTabs!: PPCNavData[];
  successColumnData!: S1DataTableColumn[];
  inProgressColumnData!: S1DataTableColumn[];
  failedColumnData!: S1DataTableColumn[];
  searchBarData!: S1SearchBar;
  paginatorData!: PPCPaginatorData;
  tableData: Transactions[] = [];
  detailsCardInputData!: {row: Transactions, details: TransactionDetailsResponse} | null;
  transactionAPIResponse!: TransactionResponse;
  taskIds: CloudToolsTaskIdEnum[] = [];
  private scopedTaskIds: CloudToolsTaskIdEnum[] = [];
  private isToolScopedRoute = false;

  activeTab = 0;
  clearSelectedRowTrigger: number = 0;
  scrollSelectedRowTrigger: number = 0;
  selectedTransactionId: string | null = null;

  selectedCloudToolsType!: CloudTools;
  private currentToolRouteKey = '';
  private readonly userPermissions = this.dataState.getUserPermissions(ApplicationIdEnum.CloudTools);
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly datePipe: DatePipe,
    private readonly cloudToolsAPISVC: CloudToolsAPIService,
    private readonly cloudToolsDataSVC: CloudToolsDataService,
    private readonly paginatorDataSVC: PpcPaginatorDataService,
    private readonly dataState: DataState,
    private readonly sidePanelSVC: SidePanelService,
    private readonly permissionDialogSVC: PermissionsLoaderDialogService,
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  @ViewChild('successTab', { static: false }) successTab!: TemplateRef<unknown>;
  @ViewChild('inProgressTab', { static: false }) inProgressTab!: TemplateRef<unknown>;
  @ViewChild('failedTab', { static: false }) failedTab!: TemplateRef<unknown>;  

  ngOnInit(): void {    
    this.initSearchBar();        
    this.initSubs();
    this.initRouteStateSubs();
  }

  private setScopedTaskIds(taskIds: CloudToolsTaskIdEnum[]): void {
    this.scopedTaskIds = [...taskIds];
  }

  private refreshTransactions(patch: Partial<TransactionRequest>): void {
    const current = this.cloudToolsDataSVC.getTransactionRequestData();
    const effectiveTaskIds = this.scopedTaskIds.length > 0
      ? this.scopedTaskIds
      : (current.taskIds ?? this.taskIds);

    const next: TransactionRequest = {
      ...current,
      ...patch,
      taskIds: effectiveTaskIds,
    };

    this.cloudToolsDataSVC.setTransactionRequestData(next);
    this.getTransactions(next);
  }

  private initResolvedTransactions(resolvedData: TransactionResponse | null | undefined): void {
    this.permissionDialogSVC.closeDialog();
    const resolved = resolvedData;

    if (!resolved) {
      this.transactionAPIResponse = {
        transactions: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
        timestamp: '',
        message: null,
      };
      this.tableData = [];
      this.isPaginatorVisible = false;
      this.cloudToolsDataSVC.setTransactionAPIInProgress(false);
      return;
    }

    this.transactionAPIResponse = resolved;
    this.tableData = [...(resolved.transactions ?? [])];
    this.initPaginator();
    this.cloudToolsDataSVC.setTransactionAPIInProgress(false);
  }

  private initRouteStateSubs(): void {
    this.activatedRoute.url.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (segments) => {
        const routeKey = segments[0]?.path ?? this.activatedRoute.snapshot.routeConfig?.path ?? '';
        const routeToolType = this.getCloudToolTypeFromRouteKey(routeKey);
        const routeTaskId = this.getCloudToolTaskIdFromRouteKey(routeKey);

        this.isToolScopedRoute = !!routeToolType;
        if (routeToolType) {
          this.selectedCloudToolsType = routeToolType;
        }
        this.setScopedTaskIds(routeTaskId ? [routeTaskId] : []);

        if (this.currentToolRouteKey && this.currentToolRouteKey !== routeKey) {
          this.resetDashboardStateForToolNavigation();
        }

        this.currentToolRouteKey = routeKey;
      },
    });

    this.activatedRoute.data.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (data) => {
        const resolved = data[CLOUD_TOOLS_ROUTE.RESOLVER] as TransactionResponse | null | undefined;
        this.initResolvedTransactions(resolved);
      },
    });
  }

  private getCloudToolTaskIdFromRouteKey(routeKey: string): CloudToolsTaskIdEnum | null {
    switch (routeKey) {
      case CLOUD_TOOLS_ROUTE.EST_MANAGER:
        return CloudToolsTaskIdEnum.LCMUpdate;
      case CLOUD_TOOLS_ROUTE.PCR_CLEANUP:
        return CloudToolsTaskIdEnum.PCRCleanup;
      case CLOUD_TOOLS_ROUTE.SANDBOX_CLEANUP:
        return CloudToolsTaskIdEnum.SandBoxCleanUp;
      case CLOUD_TOOLS_ROUTE.UPDATE_MPNID:
        return CloudToolsTaskIdEnum.UpdateMPNID;
      case CLOUD_TOOLS_ROUTE.SUBS_TRANSFER:
        return CloudToolsTaskIdEnum.SubscriptionTransfer;
      default:
        return null;
    }
  }

  private getCloudToolTypeFromRouteKey(routeKey: string): CloudTools | null {
    switch (routeKey) {
      case CLOUD_TOOLS_ROUTE.EST_MANAGER:
        return 'EST';
      case CLOUD_TOOLS_ROUTE.PCR_CLEANUP:
        return 'PCR';
      case CLOUD_TOOLS_ROUTE.SANDBOX_CLEANUP:
        return 'Sandbox';
      case CLOUD_TOOLS_ROUTE.UPDATE_MPNID:
        return 'UpdateMPNID';
      case CLOUD_TOOLS_ROUTE.SUBS_TRANSFER:
        return 'SubscriptionTransfer';
      default:
        return null;
    }
  }

  private resetDashboardStateForToolNavigation(): void {
    this.activeTab = 0;
    this.tableData = [];
    this.clearSelectedRowTrigger++;
    this.selectedTransactionId = null;
    this.isCardDetailsVisible = false;
    this.isTransactionDetailsAPIInProgress = false;
    this.detailsCardInputData = null;
    this.isPaginatorVisible = false;

    this.initSearchBar();
    this.showFilterControls = false;
    this.cdr.detectChanges();
    this.showFilterControls = true;

    this.paginatorDataSVC.setPPCPageChangeEventData(null);
    this.paginatorDataSVC.setPPCPaginatorData(null);
  }

  initSubs() {
    this.cloudToolsDataSVC.transactionAPIInProgress$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        this.showOverlay = res;
        this.showTableProgressBar = res;
        if(this.isCardDetailsVisible) {
          this.detailsCardDismissEventHandler();
        }
      },
    });
    this.paginatorDataSVC.ppcPageChangeEventData$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if(res) this.pageChangeHandler(res);
      },
    });
    this.cloudToolsDataSVC.uploadAPIState$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if (!res) {
          return;
        }
        switch (res) {
          case 'InProgress': {
            this.showOverlay = true;
            break;
          }
          case 'Failed': {
            this.showOverlay = false;
            this.cloudToolsDataSVC.clearUploadAPIState();
            break;
          }
          default: {
            this.showOverlay = false;
            // hard reset to success tab after a successful upload
            this.activeTab = 0;
            this.initTableColumn();
            this.refreshTransactions({
              statusIds: [CloudToolsStatusIdEnum.Success],
              pageNumber: 1,
              pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
            });
            this.cloudToolsDataSVC.clearUploadAPIState();
            break;
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initNavTab();
    this.initTableColumn();
    this.cdr.detectChanges();
  }

  canShowTaskTypeFilter(): boolean {
    if (this.isToolScopedRoute) {
      return false;
    }

    if (this.userPermissions.includes(PermissionsEnum.GlobalAdmin)) {
      return true;
    }

    let allowedToolsCount = 0;
    for (const permission of this.userPermissions) {
      if (ALLOWED_TOOL_PERMISSION_SET.has(permission)) {
        allowedToolsCount++;
        if (allowedToolsCount >= 2) {
          return true;
        }
      }
    }

    return false;
  }

  getTransactions(data: TransactionRequest) {
    if (!data.taskIds || data.taskIds.length === 0) {
      this.cloudToolsDataSVC.setTransactionAPIInProgress(false);
      this.tableData = [];
      this.isPaginatorVisible = false;
      return;
    }

    this.cloudToolsDataSVC.setTransactionAPIInProgress(true);
    this.cloudToolsAPISVC.getTransactions(data)
      .pipe(
        take(1),
      ).subscribe({
        next: res => {
          if(res) {
            this.transactionAPIResponse = res;
            this.tableData = [...res.transactions];
            this.initPaginator();
            this.cloudToolsDataSVC.setTransactionAPIInProgress(false);
          }
        },
        error: err => {
          console.error(`Error in Transaction API: ${err}`);
          this.cloudToolsDataSVC.setTransactionAPIInProgress(false);
        }
      });
  }

  initPaginator() {
    if(!this.transactionAPIResponse || this.transactionAPIResponse?.totalCount === 0) {
      this.isPaginatorVisible = false;
    } else {
      this.paginatorData = {
        page: this.transactionAPIResponse.pageNumber,
        pageSize: this.transactionAPIResponse.pageSize,
        total: this.transactionAPIResponse.totalCount,
        pageSizeOption: DEFAULT_PAGE_SIZE_OPTIONS,
      };
      this.paginatorDataSVC.setPPCPaginatorData(this.paginatorData);
      this.isPaginatorVisible = true;
    }
  }

  initNavTab() {
    this.navTabs = [
      {
        // TabIndex - 0
        label: 'Success',
        tabContent: this.successTab
      },
      {
        // TabIndex - 1
        label: 'In Progress',
        tabContent: this.inProgressTab
      },
      {
        // TabIndex - 2
        label: 'Failed',
        tabContent: this.failedTab,
      },
    ];
  }

  showUploadPanel(toolType?: string) {
    // Tool-scoped routes should always open the upload panel for the current route tool.
    this.selectedCloudToolsType = (toolType as CloudTools | undefined) ?? this.selectedCloudToolsType;

    if (!this.selectedCloudToolsType) {
      return;
    }

    const selectedToolPermission = CLOUD_TOOLS_PERMISSION_MAP[this.selectedCloudToolsType];

    if (!this.dataState.hasPermission([selectedToolPermission], ApplicationIdEnum.CloudTools)) {
      // User does not have permission to access this tool
      this.permissionDialogSVC.showDialog('PermissionError');
      return;
    }

    const panelComponent = this.selectedCloudToolsType === 'SubscriptionTransfer'
      ? SubsTransferUploadPanelComponent
      : UploadPanelComponent;

    this.sidePanelSVC.open(
      panelComponent,
      {
        disableClose: true,
        hasBackdrop: false,
        width: '375px',
        position: 'right',
        data: { type: this.selectedCloudToolsType },
        layoutMode: 'below-header',
        headerHeightPx: 68,
      },
    );
  }

  tabChangeHandler(tab: number) {

    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.tableData = [];
    this.selectedTransactionId = null;
    let statusIds: CloudToolsStatusIdEnum[] = [];

    switch (tab) {
      case DashboardTabEnum.Success: statusIds = [CloudToolsStatusIdEnum.Success]; break;
      case DashboardTabEnum.InProgress: statusIds = [CloudToolsStatusIdEnum.InProgress]; break;
      case DashboardTabEnum.Failed: statusIds = [CloudToolsStatusIdEnum.Failed]; break;      
    }
    this.initTableColumn();

    this.refreshTransactions({
      statusIds,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
    });
  }

  pageChangeHandler(event: PPCPageChangeEventData): void {
    const reqData = this.cloudToolsDataSVC.getTransactionRequestData();

    let tempData: Partial<TransactionRequest>;

    if (reqData.pageSize === event.pageSize) {
      tempData = {
        pageNumber: event.page,
        pageSize: event.pageSize
      };
    } else {
      // page size changed → reset to first page
      tempData = {
        pageNumber: 1,
        pageSize: event.pageSize
      };
    }

    const patch: Partial<TransactionRequest> = { ...tempData };
    // Preserve current filters/status/search and always reapply scoped taskIds.
    this.refreshTransactions(patch);
  }


  initSearchBar() {
    this.searchBarData = {
      placeHolder: 'Search',
      width: '400px',
      searchText: '',
    };
  }

  searchEventHandler(searchData: string) {
    this.refreshTransactions({
      searchText: searchData,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
      pageNumber: 1,
    });
  }

  dateRangeEventHandler(data: { [key: string]: string }) {
    // when a user chooses the 'custom' date range, first value will be the same start & end date. To catch that we use this logic here
    if (data['start'] == data['end']) return;
    const startDate = new Date(data['start']);
    const endDate = new Date(data['end']);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return;
    }

    this.refreshTransactions({
      fromDate: startDate,
      toDate: endDate,
      sortBy: 'CreatedDate',
      sortDescending: true,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
    });
  }

  initTableColumn() {
    const defaultCoulmns = [...CloudToolsHelper.getDefaultColumns(this.datePipe)];
    this.successColumnData = [...defaultCoulmns];
    this.inProgressColumnData = [...defaultCoulmns];
    this.failedColumnData = [...defaultCoulmns];
  }

  tableRowClickHandler(row: Transactions) {
    this.selectedTransactionId = row.id;
    this.isCardDetailsVisible = true;
    this.handleTDCardFlag(true);
    switch(this.activeTab) {
      case 1: this.inProgressColumnData = this.inProgressColumnData.slice(0,3); break;
      case 2: this.failedColumnData = this.failedColumnData.slice(0,3); break;
      default: this.successColumnData = this.successColumnData.slice(0,3); break;
    }
    this.getTransactionDetails(row);
  }

  private handleTDCardFlag(data: boolean) {
    this.showTableProgressBar = data;
    this.isTransactionDetailsAPIInProgress = data;
    this.showOverlay = data;
  }

  getTransactionDetails(row: Transactions) {
    let statusIds: CloudToolsStatusIdEnum[] = [];
    switch (this.activeTab) {
      case 1: statusIds = [1]; break; // InProgress tab
      case 2: statusIds = [2]; break; // Failed tab
      default: statusIds = [3]; break; // Success tab
    }
    const reqData: TransactionDetailsRequest = {
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
      parentId: row.id,
      statusIds,
    };
    this.cloudToolsAPISVC.getTransactionDetails(reqData).pipe(
      take(1),
    ).subscribe({
      next: res => {
        if(res) {
          this.detailsCardInputData = {
            details: res,
            row,
          };
          this.handleTDCardFlag(false);
        }
      },
      error: err => {
        console.error(`Error in Transaction Details API - ${err}`);
        this.handleTDCardFlag(false);
        this.detailsCardInputData = null;
       }
    });
  }

  detailsCardDismissEventHandler() {
    this.clearSelectedRowTrigger++;
    this.selectedTransactionId = null;
    this.isCardDetailsVisible = false;
    this.detailsCardInputData = null;
    this.initTableColumn();
  }

  detailsCardParentOverlayEventHandler(data: boolean) {
    this.showOverlay = data;
  }

  detailsCardGotoEventHandler() {
    this.scrollSelectedRowTrigger++;
  }

  /**
   * Returns whether the nav-tabs download action should be visible.
   * The action is shown only when a transaction row is currently selected.
   */
  shouldShowDownloadAction(): boolean {
    return !!this.selectedTransactionId;
  }

  /**
   * Downloads the CSV for the currently selected transaction.
   * No action is taken when no row is selected.
   */
  downloadCSV(): void {
    if (!this.selectedTransactionId) {
      return;
    }

    const selectedTransactionId = this.selectedTransactionId;

    this.cloudToolsAPISVC.downloadTransaction(selectedTransactionId).pipe(
      take(1),
    ).subscribe({
      next: response => {
        const contentDisposition = response.headers.get('content-disposition');

        if (!response.body) {
          return;
        }

        const downloadUrl = globalThis.URL.createObjectURL(response.body);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = this.getDownloadFileName(contentDisposition, selectedTransactionId);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        globalThis.URL.revokeObjectURL(downloadUrl);
      },
      error: err => {
        console.error(`Error downloading transaction CSV - ${err}`);
      }
    });
  }

  /**
   * Extracts the download filename from Content-Disposition.
   * Falls back to a deterministic transaction-based filename when header parsing fails.
   */
  private getDownloadFileName(contentDisposition: string | null, transactionId: string): string {
    const defaultFileName = `transaction_${transactionId}.csv`;
    if (!contentDisposition) {
      return defaultFileName;
    }

    // Prefer filename* if present (RFC 5987)
    const filenameStarMatch = /filename\*=(?:UTF-8'')?([^;\n]*)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const filenameStarRaw = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(filenameStarRaw);
      } catch {
        return filenameStarRaw;
      }
    }

    // Otherwise, fallback to filename (quoted or unquoted)
    const filenameMatch = /filename="?([^";\n]+)"?/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      return filenameMatch[1].trim();
    }

    return defaultFileName;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
