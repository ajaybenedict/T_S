import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnChanges, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { S1DataTableColumn, SortDirectionEnum, S1TableSortChangeEmitter, S1DataTableNoData, TableRowViewModel, TableStatusInfo } from 'src/app/models/s1/s1-data-table.interface';
import { TableSortHelper } from './table-sort.helper';
import { OrderResponse } from 'src/app/models/ppc/order-api.interface';
import { C3_DASHBOARD_NEEDSAPPROVAL_TOOLTIP } from 'src/app/core/constants/constants';

@Component({
  selector: 'app-s1-data-table',
  templateUrl: './s1-data-table.component.html',
  styleUrls: ['./s1-data-table.component.css'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class S1DataTableComponent<T = any> implements OnInit, OnChanges {

  declare dataSource: MatTableDataSource<TableRowViewModel<T>>;
  declare displayedColumns: string[];
  private rowViewModels: TableRowViewModel<T>[] = [];
  
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
  /** Increment this value from the parent to scroll the selected row into view. */
  @Input() scrollToSelectedRowTrigger: number = 0;
  @Output() actionEmitter = new EventEmitter<{ emitKey: string, row: T }>();
  @Output() rowEmitter = new EventEmitter<T>();
  @Output() sortChangeEmitter = new EventEmitter<S1TableSortChangeEmitter>();  

  noDataImg = '/assets/Frame.svg';
  nodatatTitle = 'No results found';
  noDataContext = 'There are no results for your current search. Adjust search criteria to improve results.';
  /** To highlight the selected row. */
  selectedRow: T | null = null;

  constructor(
    private readonly hostRef: ElementRef<HTMLElement>,
  ){}

  ngOnInit() {
    if (this.noDataMsg) {
      const { title, context, imgSrc } = this.noDataMsg;
      this.nodatatTitle = title ?? this.nodatatTitle;
      this.noDataContext = context ?? this.noDataContext;
      this.noDataImg = imgSrc ?? this.noDataImg;
    }
    this.displayedColumns = (this.tableColumns ?? []).map(col => col.columnKey);
    this.sortState = { columnID: this.activeSortColumnID, direction: this.activeSortDirection ?? SortDirectionEnum.DESCENDING };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableColumns'] && this.tableColumns) {
      this.displayedColumns = this.tableColumns.map(col => col.columnKey);
    }

    if ((changes['tableData'] || changes['tableColumns']) && this.tableData && this.tableColumns) {
      this.rebuildRowViewModels();
    }

    if (changes['clearSelectionRowTrigger']) {
      this.selectedRow = null;
    }

    if (changes['scrollToSelectedRowTrigger'] && !changes['scrollToSelectedRowTrigger'].firstChange) {
      this.scrollToSelectedRow();
    }
  }

  /**
   * Builds table row view-models once per input update to avoid expensive
   * function invocations and tooltip/status lookups during template CD cycles.
   */
  private rebuildRowViewModels(): void {
    const htmlColumns = (this.tableColumns ?? []).filter(col => col.columnType === 'html' && !!col.formatter);

    this.rowViewModels = (this.tableData ?? []).map((row) => {
      const formattedHtmlByColumn: Record<string, string> = {};

      htmlColumns.forEach((column) => {
        formattedHtmlByColumn[column.columnKey] = column.formatter ? column.formatter(row) : '';
      });

      const typedRow = row as unknown as OrderResponse;
      const warning = Boolean(typedRow?.discontinued || typedRow?.restricted);
      const statusInfo = this.buildStatusInfo(typedRow);

      return {
        raw: row,
        formattedHtmlByColumn,
        warning,
        statusInfo,
      };
    });

    this.dataSource = new MatTableDataSource<TableRowViewModel<T>>(this.rowViewModels);
  }

  onActionClick(event: Event, emitKey: string, row: T) {
    event.stopPropagation(); // Prevent row animation
    this.actionEmitter.emit({ emitKey, row });
  }

  dropdownEventHandler(event: string, row: T) {
    this.actionEmitter.emit({ emitKey: event, row });
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

  /**
   * Scrolls the currently selected row into the visible area of the table body.
   * Returns false when no row is selected.
   */
  scrollToSelectedRow(options: ScrollIntoViewOptions = {}): boolean {
    const selectedRowElement = this.hostRef.nativeElement.querySelector('tr.row-selected') as HTMLElement | null;
    if (!selectedRowElement) return false;

    const tableBody = this.hostRef.nativeElement.querySelector('.s1-data-table tbody') as HTMLElement | null;
    if (tableBody) {
      const selectedRect = selectedRowElement.getBoundingClientRect();
      const bodyRect = tableBody.getBoundingClientRect();
      const rowTopWithinViewport = selectedRect.top - bodyRect.top;
      const rowCenterOffset = selectedRect.height / 2;
      const viewportCenterOffset = tableBody.clientHeight / 2;
      const targetScrollTop = tableBody.scrollTop + rowTopWithinViewport - viewportCenterOffset + rowCenterOffset;

      tableBody.scrollTo({
        top: Math.max(targetScrollTop, 0),
        behavior: options.behavior ?? 'smooth',
      });
      return true;
    }

    selectedRowElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options,
    });
    return true;
  }

  /* C3 Dashboard - NeedsApproval table specific logic */
  private static readonly ICONS = {
    discontinued: "/assets/discontinued_icon_16_16.svg",
    restricted: "/assets/onhold_icon_16_16.svg",
  } as const;

  private static readonly TOOLTIP = C3_DASHBOARD_NEEDSAPPROVAL_TOOLTIP;
  
  private getTooltipData(row: OrderResponse, type: 'title' | 'content'): string {
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

  private buildStatusInfo(row: OrderResponse): TableStatusInfo {
    const show = Boolean(row?.discontinued || row?.restricted);
    if (!show) {
      return {
        show: false,
        iconSrc: '',
        tooltipTitle: '',
        tooltipContent: '',
      };
    }

    const iconSrc = row?.discontinued
      ? S1DataTableComponent.ICONS.discontinued
      : S1DataTableComponent.ICONS.restricted;

    return {
      show: true,
      iconSrc,
      tooltipTitle: this.getTooltipData(row, 'title'),
      tooltipContent: this.getTooltipData(row, 'content'),
    };
  }
  /* ----------------------------------------- */
}