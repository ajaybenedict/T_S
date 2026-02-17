import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { GroupedTableColumns } from 'src/app/interface/data-table-columns.interface';
import { ACTION_CONFIG } from 'src/app/config/action-button.config';
import { Button } from 'src/app/interface/button.interface';
import { DataTableService } from 'src/app/services/data-table.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TableViewControlService } from 'src/app/services/table-view-control.service';
import { OrderStatusService } from 'src/app/services/order-status.service';
import { RowScrollService } from 'src/app/services/table-row.service';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements OnInit, AfterViewInit, OnChanges {
  ACTION_CONFIG = ACTION_CONFIG;
  expandedGroupbyIds: Set<string> = new Set();
  groupedData: any;
  columns: GroupedTableColumns[] = [];
  groupByField: string = '';
  isGroupedView: boolean = false;
  displayFlattedData: any;
  selection = new SelectionModel<any>(true, []);
  selectedRows: any[] = [];
  highlightedRow: any = null;
  highlightedGroupKey: string | null = null;




  @Input() page: number = 1;
  @Input() pageSize: number = 100;
  @Input() SidePanelMiddleColspan: boolean = false;


  @Output() clickedRow = new EventEmitter<any[]>();
  @Output() ActionInformation = new EventEmitter<{ key: string, selectedOrders: any, event?: MouseEvent, position: string }>();




  constructor(private readonly dataTableService: DataTableService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly tableControlService: TableViewControlService,
    private readonly orderStatusService: OrderStatusService,
    private readonly rowScrollService: RowScrollService) { }

  ngOnInit(): void {

    this.tableControlService.isExpanded$.subscribe(({ isExpanded, source }) => {
      // Only toggle all groups when source is toolbar button
      if (source === 'toolbar') {
        this.toggleAllGroups(isExpanded);
      }
    });


    this.dataTableService.data$.subscribe(data => {
      if (this.groupByField) {
        this.groupedData = this.mergeGroupedData(data, this.groupByField);
        this.isGroupedView = true;
        // Flatten the orders for pagination
        this.displayFlattedData = this.groupedData
          .flatMap((group: { orders: any[]; }) => group.orders.map(order => ({
            rowData: group,
            orderData: order
          })));
      } else {
        this.isGroupedView = false;
      }
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['SidePanelMiddleColspan']) {
      this.cdRef.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.dataTableService.columns$.subscribe(columns => {
      this.columns = columns;
      this.groupByField = this.getGroupByField(this.columns) ?? '';
      const hasStatus = this.columns.some(col => col.isStatus);

      if (hasStatus) {
        if (this.isGroupedView) {
          this.updateGroupedDataStatus();
        } else {
          this.updateFlatDataStatus();
        }
      }

      this.cdRef.detectChanges();
    });


  }

  private updateGroupedDataStatus(): void {
    this.groupedData?.forEach((group: any) => {
      group.orders.forEach((row: any) => {
        row.finalorderStatus = this.getOrderStatus(row);
      });
    });
  }

  private updateFlatDataStatus(): void {
    this.displayFlattedData?.forEach((rowWrapper: any) => {
      rowWrapper.orderData.finalorderStatus = this.getOrderStatus(rowWrapper.orderData);
    });
  }

  toggleAllGroups(expand: boolean): void {
    if (!this.groupedData || !this.groupByField) return;

    this.expandedGroupbyIds.clear();

    if (expand) {
      for (const group of this.groupedData) {
        this.expandedGroupbyIds.add(group[this.groupByField]);
      }
    }
    this.cdRef.detectChanges();
  }

  selectedToolbarButtonAction(key: string): void {
    this.ActionInformation.emit({ key: key, selectedOrders: this.selectedRows, position: 'center' });
  }

  onLineLevelAction(actionKey: string, order: any, event: MouseEvent): void {
    this.ActionInformation.emit({ key: actionKey, selectedOrders: order, event: event, position: 'below' });
  }

  getGroupHeaderColumns(position: 'left' | 'middle' | 'right') {
    return this.columns.filter(col => col.showInGroupHeader && col.groupHeaderPosition === position);
  }

  getMiddleColspan(): number {

    if (this.SidePanelMiddleColspan) { return 3; }

    const totalCols = this.columns.length;
    const leftCols = this.getGroupHeaderColumns('left').length;
    const rightCols = this.getGroupHeaderColumns('right').length;
    return totalCols - leftCols - rightCols;
  }


  hasIssueCountGreaterThanZero(input: any): boolean {
    if (Array.isArray(input)) {
      return input.some(order => order?.issueCount > 0);
    } else {
      return input?.issueCount > 0;
    }
  }


  toggleGroup(groupByField: string): void {
    if (this.expandedGroupbyIds.has(groupByField)) {
      this.expandedGroupbyIds.delete(groupByField);
    } else {
      this.expandedGroupbyIds.add(groupByField);
    }

    const anyExpanded = this.expandedGroupbyIds.size > 0;
    this.tableControlService.setExpandState(anyExpanded);
  }


  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroupbyIds.has(groupId);
  }

  getColspanForGroup(groupKey: string): number {
    return (this.columns.filter(col => col.parentKey === groupKey).length) + 1;
  }

  getGroupByField(TableColumns: GroupedTableColumns[]): string | null {
    const frozenGroupCol = TableColumns.find(col => col.isFrozen);
    return frozenGroupCol ? frozenGroupCol.key : null;
  }

  mergeGroupedData(data: any[], groupByField: string): any[] {
    const mergedMap = new Map<string, any>();

    data.forEach(group => {
      const key = group[groupByField];

      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        existing.orders.push(...group.orders);
      } else {
        mergedMap.set(key, {
          ...group,
          orders: [...group.orders]
        });
      }
    });

    return Array.from(mergedMap.values());
  }

  getColumnActions(col: GroupedTableColumns, rowData: any, orderData: any): Button[] {
    if (col.actionKeys?.length) {
      return col.actionKeys
        .map(key => this.ACTION_CONFIG[key])
        .filter(Boolean);
    }
    return [];
  }

  getOrderStatus(row: any): { imgURL: string; key: string } {
    return this.orderStatusService.getOrderStatus(row);
  }
  //  Toggle selection of a single invoice
  toggleRow(row: any): void {
    this.selection.toggle(row);
    this.selectedRows = this.selection.selected;
  }

  // Select or deselect all invoices on current page
  toggleAllRows(): void {
    const pageInvoices = this.getCurrentPageInvoices();
    const enabledInvoices = pageInvoices.filter(row => !this.isCheckboxDisabled(row));
    const allSelected = enabledInvoices.every(row => this.selection.isSelected(row));

    if (allSelected) {
      enabledInvoices.forEach(row => this.selection.deselect(row));
    } else {
      enabledInvoices.forEach(row => this.selection.select(row));
    }

    this.selectedRows = this.selection.selected;
  }


  // Get invoices shown on the current page
  getCurrentPageInvoices(): any[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.groupedData?.slice(startIndex, startIndex + this.pageSize) ?? [];
  }

  // Check if all invoices on page are selected
  isAllSelected(): boolean {
    const enabledInvoices = this.getCurrentPageInvoices().filter(row => !this.isCheckboxDisabled(row));
    return enabledInvoices.length > 0 && enabledInvoices.every(row => this.selection.isSelected(row));
  }

  checkboxLabel(row?: any): string {
    if (row) {
      const isSelected = this.selection.isSelected(row);
      const label = isSelected ? 'Deselect' : 'Select';
      const invoice = row[this.groupByField] ?? '';
      return `${label} invoice ${invoice}`;
    } else {
      const isAllSelected = this.isAllSelected();
      const label = isAllSelected ? 'Deselect' : 'Select';
      return `${label} all invoices`;
    }
  }
  //Disable selection for invoices -- nede to add business logic
  isCheckboxDisabled(row: any): boolean {
    let hasIssues = false;
  
  if (Array.isArray(row.orders)) {
    hasIssues = row.orders.some((order: any) => order.issueCount > 0);
    row.orders.forEach((order: any) => {
      order.disabledValue = hasIssues;  
    });
  } else {
    hasIssues = row.issueCount > 0;
    row.disabledValue = hasIssues;
  }
  return hasIssues;
  }

  // Expandable rows(clicked Rows)
  onRowClick(event: KeyboardEvent | MouseEvent, row: any, groupKey?: string): void {
    this.highlightedRow = (this.highlightedRow === row) ? null : row;

    if (this.highlightedRow === null || !groupKey) {
      this.highlightedGroupKey = null;
    } else {
      this.highlightedGroupKey = groupKey;
    }

    const clickedRow = (event.target as HTMLElement).closest('tr');
    if (clickedRow) {
      const rowIndexStr = clickedRow.dataset['rowindex'];
      const childIndexStr = clickedRow.dataset['rowChildIndex'];

      const rowIndex = rowIndexStr ? Number(rowIndexStr) : 0;
      const childIndex = childIndexStr ? Number(childIndexStr) : 0;

      this.rowScrollService.scrollToRow(rowIndex, childIndex);
    }

    this.clickedRow.emit(row);
  }
}
