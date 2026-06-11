import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { DataTableService } from 'src/app/services/data-table.service';
import { MatSidenav } from '@angular/material/sidenav';
import { DialogService } from 'src/app/services/confirm-dialog.service';
import { ConfirmDialogConfig } from 'src/app/interface/confirm-dialog.interface';
import { TABS, COLUMNS, ACTIONEDCOLUMNS, DOWNLOAD_TABS } from 'src/app/config/manage-columns.config';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { APJCOUNTRY_CODE, REMOTE_ENTRY_URL } from 'src/app/constants/constants';

@Component({
  selector: 'app-dashboardcontent',
  templateUrl: './dashboardcontent.component.html',
  styleUrls: ['./dashboardcontent.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardcontentComponent implements OnInit, OnDestroy {

  isSidePanelOpen = false;
  tabs = TABS;
  columns = COLUMNS;
  downloadTabs = DOWNLOAD_TABS;
  groupedData: any;
  tablecolumns: any;
  @Input() isLoading = false;

  selectedRowCount: number = 0;
  isSelectAll: boolean = false;

  toggleAllState?: boolean;

  @ViewChild('drawer') drawer!: MatSidenav;

  @Output() selectionCountChanged = new EventEmitter<number>();


  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly dialogService: DialogService,
    private readonly dialog: MatDialog,
    private readonly notificationService: NotificationService,
  ) { }
  ngOnInit(): void {
    this.dataTableService.tab$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tab) => {
        this.columns = tab === 'NONE' ? COLUMNS : ACTIONEDCOLUMNS;
      });
    
    this.dataTableService.columns$
      .pipe(takeUntil(this.destroy$))
      .subscribe(columns => {
        this.tablecolumns = columns;
      });

    this.dataTableService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.groupedData = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // row level invoice action handler
  invoiceAction(event: { key: string, selectedOrders: any, position: string, event?: MouseEvent }): void {
    const { key, selectedOrders, position, event: mouseevent } = event;
    const placement = ['above', 'below', 'center'].includes(position)
      ? position as 'above' | 'below' | 'center'
      : 'center';

    const erp = this.validateOrders(selectedOrders);
    if (!erp) {

      this.notificationService.error(
        'Selected orders must belong to the same ERP system.',
        'Error'
      );

      return;
    }
    this.showConfirmationDialog(key, placement, mouseevent, erp);
  }


  showConfirmationDialog(actionKey: string, placement: 'above' | 'below' | 'center', event?: MouseEvent, erp?: string): void {
    const config: ConfirmDialogConfig = {
      title: actionKey,
      message: `Are you sure you want to ${actionKey} this invoice?`,
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      placement: placement,
      width: 600,
      confirmCallback: () => {
        if (erp === APJCOUNTRY_CODE) {
          this.openServiceOrderDialog();
        }

      }
    };

    this.dialogService.openConfirmDialog(config, event);
  }

  onRowSelected(row: any) {
    this.dataTableService.setSelectedOrders(row);
    this.isSidePanelOpen = true;
  }

  closeSidePanel() {
    this.isSidePanelOpen = false;
  }

  // this is to validate if the selected orders belong to the same ERP system and to extract the ERP code for APJ specific logic. It checks if the selectedOrders is a single order or an array of orders, and ensures all orders have the same ERP code before returning it. If there are multiple ERP codes, it returns an empty string.  
  validateOrders(selectedOrders: unknown): string {
    if (selectedOrders && typeof selectedOrders === 'object' && 'erpCode' in selectedOrders) {
      return (selectedOrders as any).erpCode;
    }

    let ordersArray: any[] = [];
    if (Array.isArray(selectedOrders)) {
      ordersArray = selectedOrders.map(o => o.orders);
    } else if (selectedOrders && typeof selectedOrders === 'object' && 'orders' in selectedOrders) {
      ordersArray = [(selectedOrders as any).orders];
    }
    const orders = ordersArray.flat(Infinity);
    const firstErp = orders[0]?.erpCode;
    const allSameErp = orders.every((o: any) => o.erpCode === firstErp);
    if (allSameErp) {
      return firstErp;
    }
    return '';
  }

  async openServiceOrderDialog() {
    const m = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './PpcDialogComponent'
    });

    const dialogRef = this.dialog.open(m.PpcDialogComponent, {
      width: '480px',
      data: {
        type: 'ServiceOrderIDPopup',
        header: 'Service Order ID Requirement',
        content: 'Selected APJ orders may require a Service Order ID.',
        radioGroup: [
          { value: 'Without_Service_Id', displayName: 'Proceed without Service Order ID' },
          { value: 'With_Service_Id', displayName: 'Proceed with Service Order ID' }
        ],
        primaryBtnName: 'Proceed',
        secondaryBtnName: 'Cancel'

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // APJ approval logic here
    });
  }


  onSelectAll() {
    this.toggleAllState = true;
  }

  onDeselectAll() {
    this.toggleAllState = false;
  }

  onSelectedRowCount(count: number) {
    this.selectedRowCount = count;
  }
  onIsSelectAll(isSelectAll: boolean) {    
    this.isSelectAll = isSelectAll;
  }

}
