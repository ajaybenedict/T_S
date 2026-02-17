import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableService } from 'src/app/services/data-table.service';
import { CBCDashboardAPIService } from 'src/app/services/cbcdashboard-api.service';
import { RowScrollService } from 'src/app/services/table-row.service';
import { ORDER_LEVEL_TABLE_COLUMNS } from 'src/app/config/data-table-columns.config';
import { DataTableComponent } from '../data-table/data-table.component';
import { DETAILED_VIEW_ACTION_CONFIG } from 'src/app/config/action-button.config';
import { Button } from 'src/app/interface/button.interface';
import { OrderStatusService } from 'src/app/services/order-status.service';
import { ManageColumnService } from 'src/app/services/manage-table-column.service';
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

  selectedRowIndex: number = 0;
  selectedRow: any = null;
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  tableColumns: any;
  tableData: any;
  tableexpandable!: string | null;

  selectedOrders: any;
  currentTab: string = '';

  updated_columns: any[] = [];
  fetched_managecolumn: any[] = [];

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
              this.dataTable.updateTable(this.tableColumns, this.tableData);
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

    this.dataTableService.tableexpandable$.subscribe(expandable => {
      this.tableexpandable = expandable;
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

    this.dataTable.updateTable(this.updated_columns, this.tableData);
  }

  tableId: string = '';

  onTableIdReady(id: string) {
    this.tableId = id;
  }

  onclickedOrderItem(event: { row: any; index: number }) {
    this.selectedRowIndex = event.index;
    this.selectedRow = event.row;
    this.dataTableService.setSelectedOrderLineItem(event.row.salesOrderLineId);
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
    const scrollContainer = document.querySelector('.table-wrapper .p-datatable-wrapper');
    const targetRow = scrollContainer?.querySelector(
      ` tbody tr[data-rowIndex="${this.scrollIndex}"][data-rowChildIndex="${this.scrollChildIndex}"]`
    );
    if (scrollContainer && targetRow) {
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const rowTop = targetRow.getBoundingClientRect().top;
      const offset = rowTop - containerTop;
      scrollContainer.scrollTo({ top: scrollContainer.scrollTop + offset - 135, behavior: 'smooth' });
    } else {
      console.warn('Scroll container or target row not found');
    }
  }

  onClose() {
    this.dataTableService.setTableExpandable(null);
    this.close.emit();
  }
}