import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ACTION_CONFIG } from 'src/app/config/action-button.config';
import { GroupedTableColumns } from 'src/app/interface/data-table-columns.interface';
import { Button } from 'src/app/interface/button.interface';
import { TableViewControlService } from 'src/app/services/table-view-control.service';
import { OrderStatusService } from 'src/app/services/order-status.service';
import { RowScrollService } from 'src/app/services/table-row.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NO_DATA_CONFIG } from 'src/app/config/no-data.config';

@Component({
  selector: 'app-grouped-table-view-template',
  templateUrl: './grouped-table-view-template.component.html',
  styleUrls: ['./grouped-table-view-template.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedTableViewTemplateComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  readonly ACTION_CONFIG = ACTION_CONFIG;
  expandedRows: Record<string, boolean> = {};
  expandedGroupbyIds = new Set<string>();
  groupedData: any[] = [];

  groupByField = '';

  noDataImg!: string
  nodatatTitle!: string;
  noDataContext!: string;


  selection = new SelectionModel<unknown>(true, []);
  selectedRows: unknown[] = [];

  highlightedRow: unknown = null;
  highlightedGroupKey: string | null = null;

  private readonly destroy$ = new Subject<void>();

  // INPUTS
  @Input() data: unknown[] = [];
  @Input() columns: GroupedTableColumns[] = [];
  @Input() page = 1;
  @Input() pageSize = 100;
  @Input() isLoading = false;
  @Input() sidePanelMiddleColspan = false;
  @Input() toggleAll?: boolean;
  // OUTPUTS
  @Output() clickedRow = new EventEmitter<unknown>();

  @Output()
  actionInformation = new EventEmitter<{
    key: string;
    selectedOrders: unknown;
    event?: MouseEvent;
    position: string;
  }>();

  @Output() selectedRowCount = new EventEmitter<number>();
  @Output() isSelectAll = new EventEmitter<boolean>();

  leftGroupColumns: GroupedTableColumns[] = [];
  rightGroupColumns: GroupedTableColumns[] = [];

  middleColspan = 0;

  private readonly actionCache =
    new Map<string, Button[]>();


  constructor(
    private readonly dataTableService: DataTableService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly tableControlService: TableViewControlService,
    private readonly orderStatusService: OrderStatusService,
    private readonly rowScrollService: RowScrollService
  ) { }

  ngOnInit(): void {
    this.tableControlService.isExpanded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isExpanded, source }) => {
        if (source === 'toolbar') {
          this.toggleAllGroups(isExpanded);
        }
      });

    this.dataTableService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        const config = error
          ? NO_DATA_CONFIG.error
          : NO_DATA_CONFIG.empty;

        this.noDataImg = config.img;
        this.nodatatTitle = config.title;
        this.noDataContext = config.context;

        this.cdRef.markForCheck();
      });
  }


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['toggleAll']) {
      this.toggleAllRows();
    }

    if (changes['columns']) {
      this.processColumns();
    }

    if (changes['data']) {
      this.groupedData = changes['data'].currentValue;
      this.updateGroupedDataStatus();
    }

    if (changes['sidePanelMiddleColspan']) {
      this.processColumns();
    }
  }

  ngAfterViewInit(): void {
    this.detectChanges();
  }

  private processColumns(): void {

    if (!this.columns?.length) {
      return;
    }

    this.groupByField =
      this.columns.find(col => col.isGroupKey)?.key ?? '';

    this.leftGroupColumns = this.columns.filter(
      col =>
        col.showInGroupHeader &&
        col.groupHeaderPosition === 'left'
    );

    this.rightGroupColumns = this.columns.filter(
      col =>
        col.showInGroupHeader &&
        col.groupHeaderPosition === 'right'
    );

    this.middleColspan = this.sidePanelMiddleColspan
      ? 3
      : this.columns.length -
      this.leftGroupColumns.length -
      this.rightGroupColumns.length;

    if (this.columns.some(col => col.isStatus)) {
      this.updateGroupedDataStatus();
    }

    this.cdRef.markForCheck();
  }


  private updateGroupedDataStatus(): void {

    this.groupedData?.forEach(group => {

      group.positiveOrders = [];
      group.negativeOrders = [];

      group.orders?.forEach((row: unknown) => {

        (row as { finalorderStatus: unknown }).finalorderStatus =
          this.getOrderStatus(row);

        if ((row as { totalResellerCost: number }).totalResellerCost > 0) {
          group.positiveOrders.push(row);
        } else {
          group.negativeOrders.push(row);
        }
      });

      group.positiveOrderCount =
        group.positiveOrders.length;

      group.negativeOrderCount =
        group.negativeOrders.length;

      group.hasNegativeOrders =
        group.negativeOrderCount > 0;

      group.rowSpan =
        group.positiveOrderCount +
        group.negativeOrderCount +
        (group.hasNegativeOrders ? 1 : 0);

      group.disabledValue =
        group.orders?.some(
          (o: { issueCount: number }) => (o.issueCount ?? 0) > 0
        ) ?? false;
    });
  }

  // template helpers 
  getTemplate(id: string) {
    return this.dataTableService.getTemplate(id);
  }

  getGroupHeaderColumns(position: 'left' | 'middle' | 'right') {
    return this.columns.filter(
      col =>
        col.showInGroupHeader &&
        col.groupHeaderPosition === position
    );
  }



  getColspanForGroup(groupKey: string): number {
    return (
      this.columns.filter(
        col => col.parentKey === groupKey
      ).length + 1
    );
  }

  resolveValue(col: GroupedTableColumns, data: unknown, order: unknown) {

    if (typeof col.valueGetter === 'function') {
      return col.valueGetter(data, order);
    }

    return (
      (order as { [key: string]: unknown })?.[col.key] ??
      (data as { [key: string]: unknown })?.[col.key] ??
      ''
    );
  }

  // --------------------------------------------------------------------------
  // GROUPING
  // --------------------------------------------------------------------------

  toggleAllGroups(expand: boolean): void {

    if (!this.groupedData?.length || !this.groupByField) {
      return;
    }

    const oldSize = this.expandedGroupbyIds.size;
    this.expandedGroupbyIds.clear();

    if (expand) {
      const dataLength = this.groupedData.length;
      for (let i = 0; i < dataLength; i++) {
        this.expandedGroupbyIds.add(
          this.groupedData[i][this.groupByField]
        );
      }
    }

    // Only trigger change detection if state actually changed
    if (oldSize !== this.expandedGroupbyIds.size) {
      this.detectChanges();
    }
  }

  toggleGroup(groupByField: string): void {
    if (this.expandedGroupbyIds.has(groupByField)) {
      this.expandedGroupbyIds.delete(groupByField);
    } else {
      this.expandedGroupbyIds.add(groupByField);
    }

    this.tableControlService.setExpandState(
      this.expandedGroupbyIds.size > 0
    );
  }

  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroupbyIds.has(groupId);
  }


  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------


  getColumnActions(
    col: GroupedTableColumns
  ): Button[] {

    const key =
      col.actionKeys?.join('|') ?? '';

    const cached =
      this.actionCache.get(key);

    if (cached) {
      return cached;
    }

    const actions =
      col.actionKeys
        ?.map(key => this.ACTION_CONFIG[key])
        .filter(Boolean) ?? [];

    this.actionCache.set(key, actions);

    return actions;
  }

  onLineLevelAction(
    actionKey: string,
    order: unknown,
    event: MouseEvent
  ): void {

    this.actionInformation.emit({
      key: actionKey,
      selectedOrders: order,
      event,
      position: 'below'
    });
  }

  // --------------------------------------------------------------------------
  // STATUS / VALIDATION
  // --------------------------------------------------------------------------

  getOrderStatus(row: unknown): {
    imgURL: string;
    key: string;
  } {
    return this.orderStatusService.getOrderStatus(row);
  }

  hasIssueCountGreaterThanZero(input: unknown): boolean {

    if (Array.isArray(input)) {
      return input.some(
        order => (order as { issueCount: number }).issueCount > 0
      );
    }

    return (input as { issueCount: number })?.issueCount > 0;
  }

  isCheckboxDisabled(row: unknown): boolean {
    return !!(row as { disabledValue: boolean })?.disabledValue;
  }

  private detectChanges(): void {
    this.cdRef.markForCheck();
  }


  trackByColumn(
    index: number,
    column: GroupedTableColumns
  ): string {
    return column.key;
  }

  trackByOrder(
    index: number,
    order: unknown
  ): unknown {
    return (order as { salesOrderLineId: string }).salesOrderLineId;
  }

  trackByGroup(
    index: number,
    group: unknown
  ): unknown {
    return (group as { [key: string]: unknown })[this.groupByField];
  }

  isButtonDisabled(row: unknown): boolean {

    const multipleSelected =
      this.selectedRows.length > 1;

    const rowWithOrders = row as { orders?: unknown[] };

    const hasIssues = Array.isArray(rowWithOrders.orders)
      ? rowWithOrders.orders.some(
        (order) => (order as { issueCount: number }).issueCount > 0
      )
      : (row as { issueCount: number }).issueCount > 0;

    return (
      hasIssues ||
      (
        multipleSelected &&
        this.selection.isSelected(row)
      )
    );
  }

  // --------------------------------------------------------------------------
  // SELECTION
  // --------------------------------------------------------------------------

  toggleRow(row: unknown): void {

    this.selection.toggle(row);

    this.updateSelectionState();
  }

  toggleAllRows(): void {

    const pageInvoices = this.getCurrentPageInvoices();
    const enabledInvoices: unknown[] = [];
    const pageLength = pageInvoices.length;

    // Single pass to collect enabled invoices
    for (let i = 0; i < pageLength; i++) {
      if (!this.isCheckboxDisabled(pageInvoices[i])) {
        enabledInvoices.push(pageInvoices[i]);
      }
    }

    if (!enabledInvoices.length) return;

    const allSelected = enabledInvoices.every(
      row => this.selection.isSelected(row)
    );

    const enabledLength = enabledInvoices.length;
    for (let i = 0; i < enabledLength; i++) {
      const row = enabledInvoices[i];
      if (allSelected) {
        this.selection.deselect(row);
      } else {
        this.selection.select(row);
      }
    }

    this.updateSelectionState();
  }

  private updateSelectionState(): void {

    this.selectedRows = this.selection.selected;

    this.selectedRowCount.emit(
      this.selectedRows.length
    );

    this.isSelectAll.emit(
      this.isAllSelected()
    );
  }

  getCurrentPageInvoices(): unknown[] {

    const startIndex =
      (this.page - 1) * this.pageSize;

    return (
      this.groupedData?.slice(
        startIndex,
        startIndex + this.pageSize
      ) ?? []
    );
  }

  isAllSelected(): boolean {
    const pageInvoices = this.getCurrentPageInvoices();
    let enabledCount = 0;
    let selectedCount = 0;
    const pageLength = pageInvoices.length;

    // Single pass
    for (let i = 0; i < pageLength; i++) {
      if (!this.isCheckboxDisabled(pageInvoices[i])) {
        enabledCount++;
        if (this.selection.isSelected(pageInvoices[i])) {
          selectedCount++;
        }
      }
    }

    return enabledCount > 0 && enabledCount === selectedCount;
  }

  checkboxLabel(row?: unknown): string {

    if (row) {

      const label =
        this.selection.isSelected(row)
          ? 'Deselect'
          : 'Select';

      const invoice = String(
        (row as Record<string, any>)[this.groupByField] ?? ''
      );
      return `${label} invoice ${invoice}`;
    }

    return `${this.isAllSelected()
      ? 'Deselect'
      : 'Select'
      } all invoices`;
  }

  // --------------------------------------------------------------------------
  // ROW EVENTS
  // --------------------------------------------------------------------------

  onRowClick(
    event: KeyboardEvent | MouseEvent,
    row: unknown,
    groupKey?: string
  ): void {

    this.highlightedRow =
      this.highlightedRow === row
        ? null
        : row;

    this.highlightedGroupKey =
      this.highlightedRow && groupKey
        ? groupKey
        : null;

    const clickedRow = (
      event.target as HTMLElement
    ).closest('tr');

    if (clickedRow) {
      const rowIndex = Number(
        clickedRow.dataset['rowindex'] ?? 0
      );
      const childIndex = Number(
        clickedRow.dataset['rowchildindex'] ?? 0
      );
      this.rowScrollService.scrollToRow(
        rowIndex,
        childIndex
      );
    }

    this.clickedRow.emit(row);
  }

  onToggleKeyDown(
    event: KeyboardEvent,
    group: string
  ): void {

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.toggleGroup(group);
    }
  }

  // --------------------------------------------------------------------------
  // ROW EXPANSION
  // --------------------------------------------------------------------------

  toggleExpandRow(rowData: unknown): void {

    const rowId =
      (rowData as { rowData: { salesOrderLineId: string } }).rowData.salesOrderLineId;

    if (this.expandedRows[rowId]) {
      this.expandedRows = {};
      return;
    }

    this.expandedRows = {
      [rowId]: true
    };
  }


  onRowKeydown(event: KeyboardEvent, order: unknown, group: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowClick(event, order, group);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}