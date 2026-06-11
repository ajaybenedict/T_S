import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataTableService } from 'src/app/services/data-table.service';
import { CBCDashboardAPIService } from 'src/app/services/cbcdashboard-api.service';
import { RowScrollService } from 'src/app/services/table-row.service';
import { ORDER_LEVEL_TABLE_COLUMNS } from 'src/app/config/data-table-columns.config';
import { DETAILED_VIEW_ACTION_CONFIG } from 'src/app/config/action-button.config';
import { Button } from 'src/app/interface/button.interface';
import { OrderStatusService } from 'src/app/services/order-status.service';
import { ManageColumnService } from 'src/app/services/manage-table-column.service';
import { OrderSecondLevelComponent } from '../../order-second-level-component/order-second-level-component.component';


@Component({
  selector: 'app-data-modal',
  templateUrl: './data-modal.component.html',
  styleUrls: ['./data-modal.component.css']
})
export class DataModalComponent implements OnInit {
  actnButtons: Button[] = Object.values(DETAILED_VIEW_ACTION_CONFIG);

  @Output() close = new EventEmitter<void>();
  @Output() buttonAction = new EventEmitter<{ key: string, selectedOrders: any, event?: MouseEvent, position: string }>();

  scrollIndex: number = 0;
  scrollChildIndex: number = 0;
  navigationMode: boolean = false;

  currentRowIndex: number = 1;
  selectedRowId: string | null = null;

  tableColumns: any;
  tableData: any;


  selectedOrders: any;
  currentTab: string = '';

  updated_columns: any[] = [];
  fetched_managecolumn: any[] = [];
  OrderSecondLevelComponent = OrderSecondLevelComponent;

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly apiService: CBCDashboardAPIService,
    private readonly rowScrollService: RowScrollService,
    private readonly orderStatusService: OrderStatusService,
    private readonly manageColumnService: ManageColumnService
  ) { }

  ngOnInit(): void {

    this.dataTableService.selectedOrders$.subscribe(orders => {
      if (orders) {
        this.selectedOrders = orders;
        this.updateButtonStates();
        this.apiService.getOrderLineItem(orders.salesOrderHeaderId).subscribe({
          next: (response) => {
            this.tableColumns = ORDER_LEVEL_TABLE_COLUMNS;
            this.tableData = response.orderLines;

            if (this.fetched_managecolumn.length > 0) {
              this.filterVisibleColumns();
            }
            else {
              this.updated_columns = this.tableColumns;
            }

          },
          error: (err) => {
            console.error('Failed to load order line items', err);
          }
        });
      }
    });

    this.manageColumnService.orderdetails_updatedcolumns$.subscribe((columns) => {
      this.fetched_managecolumn = columns;
      if (this.tableColumns && this.tableColumns.length > 0) {
        this.filterVisibleColumns();
      }
    });

    this.dataTableService.tab$.subscribe(tab => {
      this.currentTab = tab;
    });

    this.rowScrollService.scrollRow$.subscribe(index => {
      this.scrollIndex = index.rowIndex;
      this.scrollChildIndex = index.childIndex;
    });
  }

  private updateButtonStates(): void {
    if (!this.selectedOrders) return;

    const disable = this.selectedOrders.disabledValue;
    this.actnButtons = this.actnButtons.map(btn => ({ ...btn, disabled: disable }));
  }

  private filterVisibleColumns() {
    this.updated_columns = this.tableColumns.filter((col: { columnName: any; }) => {
      if (!col.columnName) return false;
      const visibilityConfig = this.fetched_managecolumn.find(
        (uc) => uc.displayName === col.columnName && uc.tabname === 'Order Details'
      );

      if (visibilityConfig?.visible) {
        return true;
      }
      return false;
    });

    this.updated_columns.sort((a, b) => {
      const aIndex = this.fetched_managecolumn.findIndex(uc => uc.displayName === a.columnName);
      const bIndex = this.fetched_managecolumn.findIndex(uc => uc.displayName === b.columnName);
      return aIndex - bIndex;
    });


  }




  onDetailedLevelAction(actionKey: string, event: MouseEvent): void {
    this.buttonAction.emit({ key: actionKey, selectedOrders: this.selectedOrders, event: event, position: 'above' });
  }

  getStatus(row: any) {
    return this.orderStatusService.getOrderStatus(row);
  }

  handleAction(actionKey: string): void {
    // Add the submneu logic here
  }

  onScrollButtonClick() {   
    const scrollContainer = document.querySelector('.grouped-table-view .p-datatable-wrapper');
    const targetRow = scrollContainer?.querySelector(
      ` tbody tr[data-rowIndex="${this.scrollIndex}"][data-rowChildIndex="${this.scrollChildIndex}"]`
    );
    if (scrollContainer && targetRow) {

       targetRow.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

     
    } else {
      console.warn('Scroll container or target row not found');
    }
  }

  onRowSelected(row: any) {
    this.dataTableService.setSelectedOrderLineItem(row.salesOrderLineId);
    this.navigationMode = true;
    this.currentRowIndex = this.tableData.findIndex(
      (x: any) => x.salesOrderLineId === row.salesOrderLineId
    ) + 1;

    this.selectedRowId = row.salesOrderLineId;
  }

  goNext() {
    if (this.currentRowIndex < this.tableData.length) {
      this.currentRowIndex++;

      this.selectedRowId =
        this.tableData[this.currentRowIndex - 1].salesOrderLineId;
      this.navigationMode = true;
    }
  }

  goPrevious(index: number) {
    this.currentRowIndex = index;
     if (this.currentRowIndex > 1) {
    this.currentRowIndex--;

    this.selectedRowId =
      this.tableData[this.currentRowIndex - 1].salesOrderLineId;

    this.navigationMode = true;
  } else {
    this.navigationMode = false;
    this.selectedRowId = null;
  }
  }

  onClose() {    
    this.close.emit();
  }
}