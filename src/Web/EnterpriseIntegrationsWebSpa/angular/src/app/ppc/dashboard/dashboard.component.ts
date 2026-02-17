import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { PPCNavData } from 'src/app/models/ppc-nav.model';
import { OrderActionRequest, OrderRequest, OrderResponse, SortColumnEnum } from 'src/app/models/ppc/order-api.interface';
import { S1DataTableColumn, S1TableSortChangeEmitter, SortDirectionEnum } from 'src/app/models/s1/s1-data-table.interface';
import { S1Menu } from 'src/app/models/s1/s1-menu.interface';
import { DashboardHelper } from './dashboard-helper';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { PPC_DASHBOARD_PAGE_SIZE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { PermissionsEnum } from 'src/app/core/config/permissions.config';
import { S1TableColumnManager } from 'src/app/models/s1/s1-table-column-manager.interface';
import { C3DashboardTabTypeEnum, C3DetailsCardActionEnum, S1ApprovedDeclinedDetailsCard, S1NeedsApprovalDetailsCard } from 'src/app/models/s1/s1-details-card.interface';
import { OrderLineRequest, OrderLineResponse } from 'src/app/models/ppc/order-line.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnDestroy, AfterViewInit {

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly dashboardApiSVC: PPCDashboardAPIService,
    private readonly datePipe: DatePipe,
    private readonly snackbarSVC: PpcSnackBarService,
    private readonly dataState: DataState
  ){}

  declare needsApprovalColumns: S1DataTableColumn[];
  declare approvedColumns: S1DataTableColumn[];
  declare declinedColumns: S1DataTableColumn[];
  declare tableData: OrderResponse[];
  declare declinedMenuData: S1Menu;
  declare navTabs: PPCNavData[];
  declare orderRequestData: OrderRequest;
  declare orderResponseData: OrderResponse[];  
  declare orderAPIFailedFlag: boolean;

  isOrderLineItemsVisible: boolean = false;
  isOrderLineItemsAPIInProgress: boolean = false;
  clearSelectedRowTrigger: number = 0;

  private readonly destroy$ = new Subject<void>();

  @ViewChild('needsApprovalTab', {static: false}) needsApprovalTab!: TemplateRef<any>;
  @ViewChild('approvedTab', {static: false}) approvedTab!: TemplateRef<any>;
  @ViewChild('declinedTab', {static: false}) declinedTab!: TemplateRef<any>;
  
  @Input() activeTab: number = 0;
  
  showTableProgressBar: boolean = true;
  sortDirection = SortDirectionEnum;

  showColumnManager = false;
  columnManagerData: S1TableColumnManager[] = [];

  needsApprovalDetailsCardInput : S1NeedsApprovalDetailsCard | null = null;
  approvedDeclinedDetailsCardInput: S1ApprovedDeclinedDetailsCard | null = null;
  selectedRow: OrderResponse | null = null;

  ngOnInit(): void {
    this.declinedMenuData = DashboardHelper.getDeclinedMenu();
    this.dashboardDataSVC.orderResponseData$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (res) => {
        if(res?.length) {
          this.orderResponseData = res;
          this.initTableData();
          this.dashboardDataSVC.setOrderAPIInProgress(false);
        }
      }
    });
    this.dashboardDataSVC.orderAPIInProgress$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        this.showTableProgressBar = res;
        if(this.isOrderLineItemsVisible) {
          this.hideDetailsCard();
          this.resetTableColumns();
        }
      },
    });
    this.dashboardDataSVC.orderAPIFailed$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if(res) {
          this.dashboardDataSVC.setOrderAPIInProgress(false);
          this.orderAPIFailedFlag = res;
          this.orderResponseData = [];
          this.dashboardDataSVC.setOrderResponseData(null);
          this.initTableData();
        }
      },
    });    
  }

  ngAfterViewInit(): void {
    this.initColumnManagerData();
    this.initTableColumn();
    this.initNavTab();
    this.cdr.detectChanges();
  }

  initTableColumn() {
    const hasAnyPermission = this.dataState.hasPermission([PermissionsEnum.PreProvisioningOrderApproval]);
    const defaultColumns = DashboardHelper.getDefaultColumns(this, this.datePipe);
    this.needsApprovalColumns = this.buildNeedsApprovalColumnsFromConfig(this.columnManagerData);
    this.approvedColumns = [
      ...defaultColumns,
      DashboardHelper.getActionerDetailsColumn('Approved Details', this.datePipe),
    ];
    this.declinedColumns = [
      ...defaultColumns,
      DashboardHelper.getActionerDetailsColumn('Decline Details', this.datePipe),
      ...(hasAnyPermission ? [DashboardHelper.getDropdownActionsColumn()] : [])
    ];
  }

  private buildNeedsApprovalColumnsFromConfig(config: S1TableColumnManager[]): S1DataTableColumn[] {
    // ALL possible columns (defaults + needs-approval set)
    const baseCols = [
      ...DashboardHelper.getDefaultColumns(this, this.datePipe),
      ...DashboardHelper.getNeedsApprovalColumns()
    ];

    // Always include Order Details from base set
    const orderDetailsCol = baseCols.find(c => c.columnKey === 'Order Details');

    // Map according to config order & visibility; ignore Order Details / Actions if present in config
    const managedCols = (config || [])
      .filter(c => c.visible && c.columnKey !== 'Order Details' && c.columnKey !== 'Actions')
      .map(c => baseCols.find(def => def.columnKey === c.columnKey))
      .filter(Boolean) as S1DataTableColumn[];

    // Actions column appended if user has permission
    const actionsCol = this.dataState.hasPermission([PermissionsEnum.PreProvisioningOrderApproval])
      ? DashboardHelper.getActionsColumn(['Decline', 'Approve'])
      : null;

    // Final assembled columns (single source of truth, returned)
    return [
      DashboardHelper.getStatusInfoColumn(),
      orderDetailsCol!,
      ...managedCols,
      ...(actionsCol ? [actionsCol] : [])
    ];
  }

  initTableData() {
    this.tableData = this.orderResponseData;
  }

  initNavTab() {
    this.navTabs = [
      {
        // TabIndex - 0
        label: 'Needs Approval',
        tabContent: this.needsApprovalTab,        
      },
      {
        // TabIndex - 1
        label: 'Approved',
        tabContent: this.approvedTab,       
      },
      {
        // TabIndex - 2
        label: 'Declined',
        tabContent: this.declinedTab,        
      },
    ];
  }

  tableActionEventHandler(data: {emitKey: string, row: OrderResponse}) {
    let dataToSend: OrderActionRequest = {
      OrderKey: data.row.orderKey,
      UpdatedBy: '',
      OrderStatus: 0,
    };
    let snackbarMsg: string; // only if API is success.
    let api: string;
    switch(data.emitKey) {
      case 'Approve':
        dataToSend.OrderStatus = 9;
        snackbarMsg = `Order <span class="ppc-bold-txt"> ${data.row.orderKey} </span> has been approved`;
        api = 'Approve';
        break;
      case 'Decline':
        dataToSend.OrderStatus = 10;
        snackbarMsg = `Order <span class="ppc-bold-txt"> ${data.row.orderKey} </span> has been declined`;
        api = 'Decline';
        break;
      case 'Needs Approval':
        dataToSend.OrderStatus = 2;
        snackbarMsg = `Order <span class="ppc-bold-txt"> ${data.row.orderKey} </span> has moved to Needs Approval`;
        api = 'Decline';
        break;
      default:
        throw new Error(`Emitkey not defined ${data.emitKey}`);
    }
    this.dashboardDataSVC.setOrderAPIInProgress(true);
    this.dashboardApiSVC.orderAction(dataToSend, api).pipe(
      switchMap(res => {
        if(res) {
          this.snackbarSVC.show(snackbarMsg);
          const orderData = this.dashboardDataSVC.getOrderRequestData();
          return this.dashboardApiSVC.getOrders(orderData);
        }
        return of(null);
      }),
    ).subscribe({
      next: res => {
        if(res?.length) {
          this.dashboardDataSVC.setOrderResponseData(res);
          this.dashboardDataSVC.setOrderAPIInProgress(false);
        }
      }
    });
  }

  tabChangeEventHandler(value: number) {
    if (value === this.activeTab) return;    
    this.activeTab = value;
    this.dashboardDataSVC.setActiveTabId(this.activeTab);
    if(this.isOrderLineItemsVisible) this.hideDetailsCard();    

    this.tableData = [];
    this.dashboardDataSVC.setOrderAPIInProgress(true);

    let status = "";
    switch (this.activeTab) {
      case 1: status = "6,8,9"; break; // Approved
      case 2: status = "10"; break;   // Declined
      default: status = "1,2,3,5,7"; break; // Needs Approval (0)
    }

    this.orderRequestData = this.dashboardDataSVC.getOrderRequestData();
    this.orderRequestData = {
      ...this.orderRequestData,
      Status: status,
      PageIndex: 0,
      PageSize: PPC_DASHBOARD_PAGE_SIZE,
      OrderByColumn: SortColumnEnum.ORDERDETAILS,
      SortOrder: SortDirectionEnum.DESCENDING,
    };
    this.dashboardDataSVC.setOrderRequestData(this.orderRequestData);

    // Rebuild columns
    if (this.activeTab === 0) {
      // Needs Approval tab - use the latest columnManagerData
      this.needsApprovalColumns = this.buildNeedsApprovalColumnsFromConfig(this.columnManagerData);
    } else {
      // Other tabs normal - init
      this.initTableColumn();
    }

    this.getOrderDetails();
  }  

  columnManagerToggle(value: boolean) {    
    this.showColumnManager = value;
    this.cdr.detectChanges();
  }

  initColumnManagerData() {
    this.columnManagerData = DashboardHelper.defaultColumnManagerConfig.map(col => ({...col}));
  }

  private updateColumnManagerData(newData: S1TableColumnManager[]) {
    if(this.isOrderLineItemsVisible) this.hideDetailsCard();

    // always create fresh copy
    this.columnManagerData = newData.map(c => ({ ...c }));

    // rebuild Needs Approval columns
    this.needsApprovalColumns = this.buildNeedsApprovalColumnsFromConfig(this.columnManagerData);

    // trigger CD in case of OnPush or async event
    this.cdr.detectChanges();
  }

  onColumnManagerChange(updatedCols: S1TableColumnManager[]) {
    this.updateColumnManagerData(updatedCols);
  }

  onColumnManagerReset() {
    this.updateColumnManagerData(DashboardHelper.defaultColumnManagerConfig);
  }

  sortEventHandler(data: S1TableSortChangeEmitter) {
    this.dashboardDataSVC.setOrderAPIInProgress(true);
    this.orderRequestData = this.dashboardDataSVC.getOrderRequestData();
    this.orderRequestData = {...this.orderRequestData, SortOrder: data.direction, OrderByColumn: data.columnID};
    this.dashboardDataSVC.setOrderRequestData(this.orderRequestData);
    this.getOrderDetails();
  }

  private getOrderDetails() {
    this.dashboardApiSVC.getOrders(this.orderRequestData).subscribe({
      next: (res) => {
        this.dashboardDataSVC.setOrderResponseData(res);
      }
    });
  }

  rowClickHandler(row: OrderResponse) {
    this.showTableProgressBar = true;
    this.isOrderLineItemsVisible = true;
    this.isOrderLineItemsAPIInProgress = true;
    this.selectedRow = row;
    switch (this.activeTab) {
      case 1:
        this.approvedColumns = this.approvedColumns.slice(0, 2);        
        break;
      case 2:
        this.declinedColumns = this.declinedColumns.slice(0, 2);
        break;
      default:
        this.needsApprovalColumns = this.needsApprovalColumns.slice(0, 3);
        break;      
    }
    this.getOrderLines(row);
  }

  hideDetailsCard() {
    this.isOrderLineItemsVisible = false;    
    this.clearSelectedRowTrigger++;
    this.approvedDeclinedDetailsCardInput = null;
    this.needsApprovalDetailsCardInput = null;
    this.selectedRow = null;   
  }

  detailsCardDimissHandler() {
    this.hideDetailsCard();
    this.resetTableColumns();
  }

  resetTableColumns() {
    const hasAnyPermission = this.dataState.hasPermission([PermissionsEnum.PreProvisioningOrderApproval]);
    const defaultColumns = DashboardHelper.getDefaultColumns(this, this.datePipe);
    switch (this.activeTab) {
      case 1:
        this.approvedColumns = [
          ...defaultColumns,
          DashboardHelper.getActionerDetailsColumn('Approved Details', this.datePipe),
        ];
        this.approvedDeclinedDetailsCardInput = null;
        break;
      case 2:
        this.declinedColumns = [
          ...defaultColumns,
          DashboardHelper.getActionerDetailsColumn('Decline Details', this.datePipe),
          ...(hasAnyPermission ? [DashboardHelper.getDropdownActionsColumn()] : [])
        ];
        break;
      default:
        this.needsApprovalColumns = this.buildNeedsApprovalColumnsFromConfig(this.columnManagerData);
        break;
    }
    this.approvedDeclinedDetailsCardInput = null;
    this.needsApprovalDetailsCardInput = null;
  }

  getOrderLines(row: OrderResponse) {
    const dataToSend: OrderLineRequest = {
      OrderID: row.id,
    };

    this.dashboardApiSVC.getOrderLines(dataToSend).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if (res) {                    
          this.prepareDeatilsCardInput(row, res);
        }
      }
    });
  }

  prepareDeatilsCardInput(row: OrderResponse, orderLinesRes: OrderLineResponse[]) {
    orderLinesRes[0].orderLines = orderLinesRes[0].orderLines.map(item => ({
      ...item,
      fx: row.currency,
    }));
    switch (this.activeTab) {
      case 1:        
        this.approvedDeclinedDetailsCardInput = {
          tabType: C3DashboardTabTypeEnum.Approved,          
          orderLines: [...orderLinesRes],
          fx: row.currency,          
          updatedBy: row.updatedBy,
          updatedOn: row.updatedOn,
          approvalType: row.approvalType,
          orderTotal: row.resellerCost ? row.resellerCost : '',
        };
        break;
      case 2:        
        this.approvedDeclinedDetailsCardInput = {
          tabType: C3DashboardTabTypeEnum.Declined,          
          orderLines: [...orderLinesRes],          
          updatedBy: row.updatedBy,
          updatedOn: row.updatedOn,
          approvalType: row.approvalType,
          fx: row.currency,
          orderTotal: row.resellerCost ? row.resellerCost : '',
        };
        break;
      default:        
        this.needsApprovalDetailsCardInput = {
          tabType: C3DashboardTabTypeEnum.NeedsApproval,          
          orderLines: [...orderLinesRes],          
          outstanding: row.outstanding,
          fx: row.currency,
          orderTotal: row.resellerCost ? row.resellerCost : '',
        };
        break;
    }
    this.showTableProgressBar = false;
    this.isOrderLineItemsAPIInProgress = false;
  }

  detailsCardOutputActionHandler(output: C3DetailsCardActionEnum) {    
    if(!this.selectedRow) return;
    this.tableActionEventHandler({emitKey: output, row: this.selectedRow});      
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
