import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { CloudToolsHelper } from '../cloud-tools-helper';
import { S1DataTableColumn } from 'src/app/models/s1/s1-data-table.interface';
import { S1SearchBar } from 'src/app/models/s1/s1-search-bar.interface';
import { DatePipe } from '@angular/common';
import { CLOUD_TOOL_PERMISSION_MAP, CloudTools, CloudToolsOperationFactory, CLOUD_TOOLS_PERMISSION_MAP, taskTypeData, uploadButtonData } from 'src/app/core/config/cloud-tools.config';
import { S1Checkbox } from 'src/app/models/s1/s1-filter-checkbox.interface';
import { CloudToolsStatusIdEnum, CloudToolsTaskIdEnum, TransactionDetailsRequest, TransactionDetailsResponse, TransactionRequest, TransactionResponse, Transactions } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { Subject, take, takeUntil } from 'rxjs';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { PPCPageChangeEventData, PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { DEFAULT_PAGE_SIZE_CLOUD_TOOLS, DEFAULT_PAGE_SIZE_OPTIONS } from 'src/app/core/constants/constants';
import { S1DropDownButton } from 'src/app/models/s1/s1-drop-down-button.interface';
import { S1MenuItem } from 'src/app/models/s1/s1-menu.interface';
import { DataState } from 'src/app/core/services/data-state';
import { PermissionsEnum } from 'src/app/core/config/permissions.config';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { UploadPanelComponent } from '../upload-panel/upload-panel.component';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';

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

  navTabs!: PPCNavData[];
  successColumnData!: S1DataTableColumn[];
  inProgressColumnData!: S1DataTableColumn[];
  failedColumnData!: S1DataTableColumn[];
  searchBarData!: S1SearchBar;
  paginatorData!: PPCPaginatorData;
  tableData!: Transactions[];
  detailsCardInputData!: {row: Transactions, details: TransactionDetailsResponse} | null;
  transactionRequestData!: TransactionRequest;
  transactionAPIResponse!: TransactionResponse;

  cloudToolOperations!: S1Checkbox[];

  taskTypes: S1Checkbox[] = taskTypeData;
  cloudToolsButtonData: S1DropDownButton | null = null;
  taskIds: number[] = [];

  activeTab = 0;
  clearSelectedRowTrigger: number = 0;

  selectedCloudToolsType!: CloudTools;
  private readonly userPermissions = this.dataState.getUserPermissions();
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
  ) { }

  @ViewChild('successTab', { static: false }) successTab!: TemplateRef<unknown>;
  @ViewChild('inProgressTab', { static: false }) inProgressTab!: TemplateRef<unknown>;
  @ViewChild('failedTab', { static: false }) failedTab!: TemplateRef<unknown>;
  @ViewChild('requestAccess', { static: true }) requestAccessTemplate!: TemplateRef<unknown>;

  ngOnInit(): void {
    this.initSearchBar();
    this.initCloudToolsButton();
    this.initOperationDropdown();
    this.initSubs();
    this.initApiCall();
  }

  private initApiCall() {
    this.transactionRequestData = this.cloudToolsDataSVC.getTransactionRequestData();
    this.getTransactions(this.transactionRequestData);
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
            break;
          }
          default: {
            this.showOverlay = false;
            const req = {...this.cloudToolsDataSVC.getTransactionRequestData(), statusIds: [CloudToolsStatusIdEnum.Success]};
            this.getTransactions(req);
            this.cloudToolsDataSVC.setTransactionRequestData(req);
            // hard reset to success tab after a successful upload
            this.activeTab = 0;
            this.tabChangeHandler(0);
            break;
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initNavTab();
    this.initTableColumn();
    this.initTableData();
    this.cdr.detectChanges();
  }

  canShowTaskTypeFilter(): boolean {
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

  private initOperationDropdown(): void {
    const allOperations = CloudToolsOperationFactory.getOperationsTools();
    const userPermissions = this.dataState.getUserPermissions();
    this.cloudToolOperations = allOperations.filter(op => this.hasPermissionForOperation(op.key as CloudToolsTaskIdEnum, userPermissions));
    this.taskIds = this.cloudToolOperations.map(op => Number(op.key));
    const updatedRequest: TransactionRequest = {
      ...this.cloudToolsDataSVC.getTransactionRequestData(),
      taskIds: this.taskIds
    };
    this.cloudToolsDataSVC.setTransactionRequestData(updatedRequest);
  }

  private hasPermissionForOperation(taskId: CloudToolsTaskIdEnum, userPermissions: PermissionsEnum[]): boolean {
    const requiredPermission = CLOUD_TOOL_PERMISSION_MAP[taskId];
    if (userPermissions.includes(PermissionsEnum.GlobalAdmin)) {
      return true;
    }
    return userPermissions.includes(requiredPermission);
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

  initCloudToolsButton(): void {
    const allTools = Object.keys(uploadButtonData) as CloudTools[];

    const subMenu: S1MenuItem[] = allTools.map(tool => {
      const cfg = uploadButtonData[tool];
      const hasAccess = this.hasPermissionForCloudTool(tool, this.userPermissions);

      return {
        hasIcon: false,
        hasName: true,
        onClickEmit: cfg.emit,
        displayName: cfg.display,
        tagTemplate: hasAccess ? undefined : this.requestAccessTemplate,
      };
    });

    this.cloudToolsButtonData = {
      hasIcon: false,
      hasTitle: true,
      title: 'Tools',
      subMenu,
    };
  }

  private hasPermissionForCloudTool(tool: CloudTools, userPermissions: PermissionsEnum[]): boolean {
    if (userPermissions.includes(PermissionsEnum.GlobalAdmin)) {
      return true;
    }
    const requiredPermission = CLOUD_TOOLS_PERMISSION_MAP[tool];
    return userPermissions.includes(requiredPermission);
  }


  showUploadPanel(toolType: string) {
    // Already our interface is emitting as CloudTools. S1-Menu is emitting as string and we convert here.
    this.selectedCloudToolsType = toolType as CloudTools;

    const selectedToolPermission = CLOUD_TOOLS_PERMISSION_MAP[this.selectedCloudToolsType];

    if (!this.dataState.hasPermission([selectedToolPermission])) {
      // User does not have permission to access this tool
      this.permissionDialogSVC.showDialog('PermissionError');
      return;
    }

    this.sidePanelSVC.open(
      UploadPanelComponent,
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
    this.cloudToolsDataSVC.setTransactionAPIInProgress(true);
    let statusIds: CloudToolsStatusIdEnum[] = [];

    switch (tab) {
      case 1: statusIds = [1]; break; // InProgress tab
      case 2: statusIds = [2]; break; // Failed tab
      default: statusIds = [3]; break; // Success tab
    }

    const currReqData = this.cloudToolsDataSVC.getTransactionRequestData();

    let reqData = {
      ...currReqData,
      statusIds,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
    };

    this.cloudToolsDataSVC.setTransactionRequestData(reqData);
    this.initTableColumn();
    this.getTransactions(reqData);
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

    const dataToSend = { ...reqData, ...tempData };
    this.cloudToolsDataSVC.setTransactionRequestData(dataToSend);
    this.getTransactions(dataToSend);
  }


  initSearchBar() {
    this.searchBarData = {
      placeHolder: 'Search',
      width: '400px',
      searchText: '',
    };
  }

  searchEventHandler(searchData: string) {
    let dataToSend: Partial<TransactionRequest>;
    dataToSend = {
      searchText: searchData,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
      pageNumber: 1,
    };
    this.cloudToolsDataSVC.setTransactionRequestData(dataToSend);
    this.getTransactions(this.cloudToolsDataSVC.getTransactionRequestData());
  }

  dateRangeEventHandler(data: { [key: string]: string }) {
    // when a user chooses the 'custom' date range, first value will be the same start & end date. To catch that we use this logic here
    if (data['start'] == data['end']) return;
    let dateFilter: Partial<TransactionRequest> = {
      fromDate: new Date(data['start']),
      toDate: new Date(data['end']),
      sortBy: 'CreatedDate',
      sortDescending: true,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
    };
    this.cloudToolsDataSVC.setTransactionRequestData(dateFilter);
    this.getTransactions(this.cloudToolsDataSVC.getTransactionRequestData());
  }

  onOperationDropdownChange(data: S1Checkbox[]): void {
    const taskIds: CloudToolsTaskIdEnum[] = data.filter(item => item.checked).map(item => item.key as CloudToolsTaskIdEnum);
    const updatedRequest: TransactionRequest = {
      ...this.cloudToolsDataSVC.getTransactionRequestData(),
      taskIds: taskIds.length ? taskIds : this.taskIds,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
    };
    this.cloudToolsDataSVC.setTransactionRequestData(updatedRequest);
    this.getTransactions(updatedRequest);
  }

  initTableColumn() {
    const defaultCoulmns = [...CloudToolsHelper.getDefaultColumns(this.datePipe)];
    this.successColumnData = [...defaultCoulmns];
    this.inProgressColumnData = [...defaultCoulmns];
    this.failedColumnData = [...defaultCoulmns];
  }

  initTableData() {
    this.tableData = [];
  }

  tableRowClickHandler(row: Transactions) {
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
    this.isCardDetailsVisible = false;
    this.detailsCardInputData = null;
    this.initTableColumn();
  }

  detailsCardParentOverlayEventHandler(data: boolean) {
    this.showOverlay = data;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
