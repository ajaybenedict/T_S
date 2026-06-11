import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CloudToolsPanelContent, CloudToolsSidePanelDetailsTabEnum, CloudToolsStatusIdEnum, CloudToolsTaskIdEnum, TransactionDetails, TransactionDetailsRequest, TransactionDetailsResponse, Transactions } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { S1DataTableColumn } from 'src/app/models/s1/s1-data-table.interface';
import { S1TextDisplay } from 'src/app/models/s1/s1-text-display.interface';
import { CloudToolsSidePanelHelper } from "../CloudToolsSidePanelHelper";
import { CloudToolsTableColumnBuilder } from "../CloudToolsTableColumnBuilder";
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { PPCPageChangeEventData, PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { DEFAULT_PAGE_SIZE_CLOUD_TOOLS, DEFAULT_PAGE_SIZE_OPTIONS } from 'src/app/core/constants/constants';
import { Subject, take, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolType } from 'src/app/core/config/cloud-tools.config';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { DetailsSidePanelComponent } from '../details-side-panel/details-side-panel.component';

@Component({
  selector: 'app-cloud-tools-card-details',
  templateUrl: './cloud-tools-card-details.component.html',
  styleUrls: ['./cloud-tools-card-details.component.css'],
  providers: [PpcPaginatorDataService],
})
export class CloudToolsCardDetailsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() inputData!: {row: Transactions, details: TransactionDetailsResponse};
  @Input() createdBy!: string;
  @Input() activeTabId!:number;
  @Output() dismissEvent = new EventEmitter<void>();
  @Output() showOverlayInParent = new EventEmitter<boolean>();
  @Output() gotoEmitter = new EventEmitter<void>();

  createdByTextDisplay!: S1TextDisplay;
  requestedByTextDisplay!: S1TextDisplay;
  tableData!: TransactionDetails[];
  tableColumn!:S1DataTableColumn[];
  paginatorData!: PPCPaginatorData;
  currTDRequest!: TransactionDetailsRequest;

  clearSelectedRowTrigger: number = 0;
  detailsCardInputData!: CloudToolsPanelContent[];
  sidePanelTitle!: string;

  isPaginatorVisible = false;
  showTableProgressBar = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly cloudToolsAPISVC: CloudToolsAPIService,
    private readonly paginatorDataSVC: PpcPaginatorDataService,
    private readonly datePipe: DatePipe,
    private readonly sidePanelSVC: SidePanelService,
  ) {}

  ngOnInit(): void {
    // since activeTabId is a number, we use this type of comparison
    if(this.activeTabId === null) return;
    if (!this.inputData?.row || !this.inputData?.details) return;
    this.initSubs();
    this.initTask();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['rowData']) {
      this.initTask();
    }
  }

  initTask() {
    this.initTextDisplay(this.inputData.row.createdBy, 'createdBy');
    this.initTextDisplay(this.inputData.row.requestedBy, 'requestedBy');
    this.prepareCurrentTransactionDetailsRequest(this.inputData.details);
    this.initTableColumn();
    this.initTableData();
    this.initPaginator();
  }

  initSubs() {
    this.paginatorDataSVC.ppcPageChangeEventData$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: event => {
        if(event) this.pageChangeEventHandler(event);
      }
    });
  }

  initTextDisplay(value: string, type: 'createdBy' | 'requestedBy') {
    const textDisplay: S1TextDisplay = {
      height: '48px',
      width: '100%',
      padding: '8px 12px',
      color: '#63666A',
      title: value,
    };
    if (type === 'createdBy') {
      this.createdByTextDisplay = textDisplay;
    } else {
      this.requestedByTextDisplay = textDisplay;
    }
  }  

  initTableColumn(): void {
    const toolType = this.resolveToolType(this.inputData.row.taskId);
    const tabType = this.resolveTabType(this.activeTabId);
    const outputMessage = this.resolveOutputMessage(toolType, tabType, '') ?? '';
    this.tableColumn = CloudToolsTableColumnBuilder.build(toolType, tabType, this.datePipe, outputMessage);
  }


  private resolveToolType(taskId: number): CloudToolType {
    switch (taskId) {
      case CloudToolsTaskIdEnum.LCMUpdate:
        return CloudToolType.EST;

      case CloudToolsTaskIdEnum.SandBoxCleanUp:
        this.sidePanelTitle = 'Sandbox Cleanup Details';
        return CloudToolType.SandboxCleanup;

      case CloudToolsTaskIdEnum.PCRCleanup:
        this.sidePanelTitle = 'PCR Cleanup Details';
        return CloudToolType.PCRCleanup;
      
      case CloudToolsTaskIdEnum.UpdateMPNID:
        this.sidePanelTitle = 'MpnID Details';
        return CloudToolType.UpdateMPNID;

      case CloudToolsTaskIdEnum.SubscriptionTransfer:
        this.sidePanelTitle = 'Subscription Transfer Details';
        return CloudToolType.SubscriptionTransfer;

      default:
        throw new Error(`Unsupported Cloud Tool taskId: ${taskId}`);
    }
  }

  private resolveTabType(tabId: number): CloudToolsStatusIdEnum {
    switch (tabId) {
      case 1:
        return CloudToolsStatusIdEnum.InProgress;
      case 2:
        return CloudToolsStatusIdEnum.Failed;
      default:
        return CloudToolsStatusIdEnum.Success;
    }
  }

  private resolveOutputMessage(tool: CloudToolType, tab: CloudToolsStatusIdEnum, message: string): string | null {
    if (tool === CloudToolType.EST) {
      return null;
    }
    switch (tool) {
      case CloudToolType.SandboxCleanup:
        return this.getSandboxOutputMessage(tab);
      case CloudToolType.PCRCleanup:
        return this.getPCROutputMessage(tab);
      case CloudToolType.UpdateMPNID:
        return this.getMpnIDOutputMessage(tab, message);
      case CloudToolType.SubscriptionTransfer:
        return this.getSubscriptionTransferOutputMessage(tab);
      default:
        return null;
    }
  }

  private getSandboxOutputMessage(tab: CloudToolsStatusIdEnum): string {
    let result = '';
    switch (tab) {
      case CloudToolsStatusIdEnum.Success:
        result = 'Sandbox cleanup completed successfully';
        break;
      case CloudToolsStatusIdEnum.InProgress:
        result = 'Sandbox cleanup is in progress';
        break;
      case CloudToolsStatusIdEnum.Failed:
        result = 'Sandbox cleanup failed';
        break;
    }
    return result;
  }

  private getPCROutputMessage(tab: CloudToolsStatusIdEnum): string {
    let result = '';
    switch (tab) {
      case CloudToolsStatusIdEnum.Success:
        result = 'PCR cleanup completed successfully';
        break;
      case CloudToolsStatusIdEnum.InProgress:
        result = 'PCR cleanup is in progress';
        break;
      case CloudToolsStatusIdEnum.Failed:
        result = 'PCR cleanup failed';
        break;
    }
    return result;
  }

  private getMpnIDOutputMessage(tab: CloudToolsStatusIdEnum, message: string): string {
    let result = '';
    switch (tab) {
      case CloudToolsStatusIdEnum.Success:
        result = message == '' ? 'MpnID update completed successfully' : message;
        break;
      case CloudToolsStatusIdEnum.InProgress:
        result = 'MpnID update is in progress';
        break;
      case CloudToolsStatusIdEnum.Failed:
        result = 'MpnID update failed';
        break;
    }    
    return result;
  }

  private getSubscriptionTransferOutputMessage(tab: CloudToolsStatusIdEnum): string {
    let result = '';
    switch (tab) {
      case CloudToolsStatusIdEnum.Success:
        result = 'Subscription transfer completed successfully';
        break;
      case CloudToolsStatusIdEnum.InProgress:
        result = 'Subscription transfer is in progress';
        break;
      case CloudToolsStatusIdEnum.Failed:
        result = 'Subscription transfer failed';
        break;
    }    
    return result;
  }

  tableRowClickHandler(rowData: TransactionDetails): void {
    const toolType = this.resolveToolType(this.inputData.row.taskId);
    const tabType = this.resolveTabType(this.activeTabId);
    // Feed row-level ErrorMessage into Output Message so detail panel reflects API advisory text.
    const errorMessage =
      typeof rowData.response === 'object' && rowData.response !== null && 'ErrorMessage' in rowData.response
        ? (rowData.response as any).ErrorMessage
        : '';
    const outputMessage = this.resolveOutputMessage(toolType, tabType, errorMessage) ?? '';
    const rows = CloudToolsSidePanelHelper.buildDetailsFormRows(rowData, toolType, tabType, outputMessage);
    const formTab: CloudToolsPanelContent = {
      type: 'filter',
      displayName: 'Details',
      onClickEvent: CloudToolsSidePanelDetailsTabEnum.Details,
      selected: true,
      tabType: 'form',
      rows: [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    };
    this.detailsCardInputData = [formTab];

    const panelRef = this.sidePanelSVC.open(
      DetailsSidePanelComponent,
      {
        disableClose: true,
        hasBackdrop: false,
        width: '375px',
        position: 'right',
        data: { title: this.sidePanelTitle, panelContent: this.detailsCardInputData },
        layoutMode: 'below-header',
        headerHeightPx: 68,
      },
    );

    panelRef.afterClosed().pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => this.onDetailsPanelClosed(),
    });
  }

  onDetailsPanelClosed() {
    this.detailsCardInputData = [];
    this.clearSelectedRowTrigger--;
  }

  initTableData() {
    this.tableData = [...this.inputData.details.transactions];
  }

  initPaginator() {
    if(!this.tableData || this.tableData.length === 0) {
      this.isPaginatorVisible = false;
    } else {
      this.paginatorData = {
        total: this.inputData.details.totalCount,
        page: this.inputData.details.pageNumber,
        pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
        pageSizeOption: DEFAULT_PAGE_SIZE_OPTIONS,
      };
      this.paginatorDataSVC.setPPCPaginatorData(this.paginatorData);
      this.isPaginatorVisible = true;
    }
  }

  prepareCurrentTransactionDetailsRequest(data: TransactionDetailsResponse) {

    let statusIds: CloudToolsStatusIdEnum[] = [];

    switch (this.activeTabId) {
      case 1: statusIds = [CloudToolsStatusIdEnum.InProgress]; break; // InProgress tab
      case 2: statusIds = [CloudToolsStatusIdEnum.Failed]; break; // Failed tab
      default: statusIds = [CloudToolsStatusIdEnum.Success]; break; // Success tab
    }

    this.currTDRequest = {
      statusIds,
      parentId: this.inputData.row.id,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
    };
  }

  pageChangeEventHandler(event: PPCPageChangeEventData ) {

    let reqData: TransactionDetailsRequest = {
      statusIds: this.currTDRequest.statusIds,
      parentId: this.currTDRequest.parentId,
      pageNumber: this.currTDRequest.pageNumber ?? 1,
      pageSize: this.currTDRequest.pageSize ?? DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
    };

    if (reqData.pageSize === event.pageSize) {
      reqData = {
        ...reqData,
        pageNumber: event.page,
        pageSize: event.pageSize
      };
    } else {
      // page size changed → reset to first page
      reqData = {
        ...reqData,
        pageNumber: 1,
        pageSize: event.pageSize
      };
    }

    this.getTransactionDetails(reqData);

  }

  getTransactionDetails(data: TransactionDetailsRequest) {

    this.showOverlayInParent.emit(true);
    this.showTableProgressBar = true;

    this.cloudToolsAPISVC.getTransactionDetails(data).pipe(
      take(1),
    ).subscribe({
      next: res => {
        if(res) {
          this.prepareCurrentTransactionDetailsRequest(res);
          this.tableData = [...res.transactions];
          this.showTableProgressBar = false;
          this.showOverlayInParent.emit(false);
        }
      },
      error: err => {
        console.error(`Error in Transaction Details API - Details card pagination event - ${err}`);
        this.showTableProgressBar = false;
        this.showOverlayInParent.emit(false);
      }
    });
  }

  gotoClickHandler(): void {
    this.gotoEmitter.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
