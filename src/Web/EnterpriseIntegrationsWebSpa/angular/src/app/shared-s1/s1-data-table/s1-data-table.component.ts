import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { S1DataTableColumn, SortDirectionEnum, S1TableSortChangeEmitter, S1DataTableNoData } from 'src/app/models/s1/s1-data-table.interface';
import { TableSortHelper } from './table-sort.helper';
import { OrderResponse } from 'src/app/models/ppc/order-api.interface';
import { C3_DASHBOARD_NEEDSAPPROVAL_TOOLTIP } from 'src/app/core/constants/constants';

@Component({
  selector: 'app-s1-data-table',
  templateUrl: './s1-data-table.component.html',
  styleUrls: ['./s1-data-table.component.css'],
  standalone: false,
})
export class S1DataTableComponent<T = any> implements OnInit, OnChanges {

  declare dataSource: MatTableDataSource<T>;
  declare displayedColumns: string[];
  
  isRowClicked = false;
  sortDirection: SortDirectionEnum = SortDirectionEnum.ASCENDING;

  declare sortState: S1TableSortChangeEmitter;

  @Input() showProgressBar!: boolean;
  @Input() tableColumns!: S1DataTableColumn[];
  @Input() tableData!: T[];
  @Input() activeSortColumnID: number = 0;
  @Input() activeSortDirection!: SortDirectionEnum;
  @Input() noDataMsg!: S1DataTableNoData | null;
  @Input() hasNoDataImg: boolean = true;
  /** Data table's tbody max-height. */
  @Input() tbodyMaxHeight: string = 'calc(100vh - 465px)';
  @Input() selectedRowBgColor: string = '#005758';
  @Input() selectedRowFontColor: string = '#ffffff';
  @Input() hoverRowBgColor: string = '#F8F8F8';
  /** When true, rows with `discontinued` or `restricted` get a different hover color. */
  @Input() enableWarningHover: boolean = false;
  /** Hover color for rows marked as `discontinued` or `restricted` (when `enableWarningHover` is true). */
  @Input() warningHoverRowBgColor: string = '#F2E4E7';

  /** To clear the selected row from the parent component. Increment this value to clear the selected row. */
  @Input() clearSelectionRowTrigger: number = 0;
  @Output() actionEmitter = new EventEmitter<{ emitKey: string, row: T }>();
  @Output() rowEmitter = new EventEmitter<T>();
  @Output() sortChangeEmitter = new EventEmitter<S1TableSortChangeEmitter>();  

  noDataImg = '/assets/Frame.svg';
  nodatatTitle = 'No results found';
  noDataContext = 'There are no results for your current search. Adjust search criteria to improve results.';
  /** To highlight the selected row. */
  selectedRow: T | null = null;

  constructor(
    private readonly sanitizer : DomSanitizer,
  ){}

  ngOnInit() {
    if (this.noDataMsg) {
      const { title, context, imgSrc } = this.noDataMsg;
      this.nodatatTitle = title ?? this.nodatatTitle;
      this.noDataContext = context ?? this.noDataContext;
      this.noDataImg = imgSrc ?? this.noDataImg;
    }
    this.displayedColumns = this.tableColumns.map(col => col.columnKey);
    this.sortState = { columnID: this.activeSortColumnID, direction: this.activeSortDirection ?? SortDirectionEnum.DESCENDING };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData'] && this.tableData) {
      this.dataSource = new MatTableDataSource<T>(this.tableData);
    }

    if (changes['tableColumns'] && this.tableColumns) {
      this.displayedColumns = this.tableColumns.map(col => col.columnKey);
    }

    if (changes['clearSelectionRowTrigger']) {
      this.selectedRow = null;
    }
  }

  setTableDataSource(data: T[]) {
    if (data) {
      this.dataSource = new MatTableDataSource<T>(data);
    }
  }

  onActionClick(event: Event, emitKey: string, row: T) {
    event.stopPropagation(); // Prevent row animation
    this.actionEmitter.emit({ emitKey, row });
  }

  dropdownEventHandler(event: string, row: T) {
    this.actionEmitter.emit({ emitKey: event, row });
  }

  getSanitizedContent(value: string) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  onRowClick(event: Event, row: T) {
    event.stopPropagation();
    // to prevent the same row being clicked.
    if(this.selectedRow === row) return;
    this.selectedRow = row;
    this.rowEmitter.emit(row);
  }

  toggleSort(column: S1DataTableColumn) {
    this.sortState = TableSortHelper.toggleSort(this.sortState, column.columnID);
    this.sortChangeEmitter.emit(this.sortState);
  }
  isColumnSortedAsc = (key: number) => TableSortHelper.isSortedAsc(this.sortState, key);
  isColumnSortedDesc = (key: number) => TableSortHelper.isSortedDesc(this.sortState, key);

  /* C3 Dashboard - NeedsApproval table specific logic */
  private static readonly ICONS = {
    discontinued: "/assets/discontinued_icon_16_16.svg",
    restricted: "/assets/onhold_icon_16_16.svg",
  } as const;

  private static readonly TOOLTIP = C3_DASHBOARD_NEEDSAPPROVAL_TOOLTIP;
  
  showStatusInfoIcon(row: OrderResponse): boolean {
    return Boolean(row?.discontinued || row?.restricted);
  }

  getStatusInfoIconSource(row: OrderResponse): string {
    if (row?.discontinued) {
      return S1DataTableComponent.ICONS.discontinued;
    }
    if (row?.restricted) {
      return S1DataTableComponent.ICONS.restricted;
    }
    return '';
  }

  getTooltipData(row: OrderResponse, type: 'title' | 'content'): string {
    if (row?.discontinued) {
      return type === 'title'
        ? S1DataTableComponent.TOOLTIP.DISCONTINUED.TITLE
        : S1DataTableComponent.TOOLTIP.DISCONTINUED.CONTENT;
    }
    if (row?.restricted) {
      return type === 'title'
        ? S1DataTableComponent.TOOLTIP.RESTRICTED.TITLE
        : S1DataTableComponent.TOOLTIP.RESTRICTED.CONTENT;
    }
    return '';
  }
  /* ----------------------------------------- */
}