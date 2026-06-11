import { Component, Renderer2, RendererFactory2, OnInit, OnDestroy } from '@angular/core';
import { CBCDashboardAPIService } from 'src/app/services/cbcdashboard-api.service';
import { BILLING_ACTIONED_COLUMNS, BILLING_COLUMNS } from 'src/app/config/data-table-columns.config';
import { DateRangeService } from 'src/app/services/date-range.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { REMOTE_ENTRY_BASEURL, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from 'src/app/constants/constants';
import { ManageColumnService } from 'src/app/services/manage-table-column.service';
import { ColumnConfig } from 'src/app/interface/manage-column.interface';
import { GroupedTableColumns } from 'src/app/interface/data-table-columns.interface';
import { InvoiceList } from 'src/app/interface/cbc-dashboard-api.interface';
import { Subject, combineLatest, EMPTY } from 'rxjs';
import { takeUntil, finalize, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-cbcdashboard',
  templateUrl: './cbcdashboard.component.html',
  styleUrls: ['./cbcdashboard.component.css']
})
export class CbcdashboardComponent implements OnInit, OnDestroy {

  /* ---------------- UI STATE ---------------- */
  isAnySelectedOnPage = false;
  isLoading = false;

  tableColumns = BILLING_COLUMNS;
  tableData: InvoiceList[] = [];

  daterange = { start: '', end: '' };
  currentTableType = 'NONE';
  searchValue = '';

  updated_columns: GroupedTableColumns[] = [];

  paginatorInput = {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    pageSizeOption: DEFAULT_PAGE_SIZE_OPTIONS
  };

  /* ---------------- INTERNAL ---------------- */

  private readonly destroy$ = new Subject<void>();
  search$ = new Subject<string>();
  pageChange$ = new Subject<{ page: number; pageSize: number }>();

  private readonly renderer: Renderer2;
  injectedStyleLink?: HTMLLinkElement;
  fetched_managecolumn: ColumnConfig[] = [];

  constructor(
    private readonly cbcDashboardApi: CBCDashboardAPIService,
    private readonly dateRangeService: DateRangeService,
    private readonly datatableService: DataTableService,
    private readonly rendererFactory: RendererFactory2,
    private readonly manageColumnService: ManageColumnService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /* ---------------- INIT ---------------- */

  ngOnInit(): void {
    this.loadExternalStyle(
      REMOTE_ENTRY_BASEURL + 'assets/legacy/Content/cbc-ui.css'
    );

    this.datatableService.setColumns(this.tableColumns);

    /* Column config */
    this.manageColumnService.columns$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { tabname: string; columns: ColumnConfig[] }) => {
        if (data.tabname === 'Invoice Details') {
          this.fetched_managecolumn = data.columns;
          this.filterVisibleColumns();
        }
      });

    /* MAIN REACTIVE DATA PIPELINE */
    combineLatest([
      this.dateRangeService.dateRange$.pipe(startWith(null)),
      this.pageChange$.pipe(
        startWith({
          page: this.paginatorInput.page,
          pageSize: this.paginatorInput.pageSize
        })
      ),
      this.search$.pipe(
        startWith('')
      )
    ])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([dateRange, page, search]) => {
          if (!dateRange) return EMPTY;

          this.isLoading = true;

          this.daterange = dateRange;
          this.searchValue = search;

          this.paginatorInput.page = page.page;
          this.paginatorInput.pageSize = page.pageSize;

          return this.cbcDashboardApi
            .getInvoiceListInformation(this.buildPayload())
            .pipe(finalize(() => (this.isLoading = false)));
        })
      )
      .subscribe({
        next: (data: InvoiceList[]) => {
          this.datatableService.setError(false);
          const result: InvoiceList[] = Array.isArray(data) ? data : [];
          this.updateTableData(result);

          this.paginatorInput = {
            ...this.paginatorInput,
            total: data[0]?.totalCount ?? 0
          };

        },
        error: (err) => {
          console.error(err);
          this.datatableService.setError(true);
          this.updateTableData([]);
        }
      });
  }

  /* ---------------- UI EVENTS ---------------- */

  handlePageChange(page: number, pageSize: number) {
    this.pageChange$.next({ page, pageSize });
  }

  onTabTypeChange(type: string): void {
    this.currentTableType =
      type === 'BillingList' ? 'NONE' : type;

    this.datatableService.setTab(this.currentTableType);
    this.tableColumns =
      type === 'BillingList'
        ? BILLING_COLUMNS
        : BILLING_ACTIONED_COLUMNS;

    this.datatableService.setColumns(this.tableColumns);

    this.triggerReload();
  }

  onSearchValueChange(value: string): void {
    this.search$.next(value);
  }

  /* ---------------- DATA ---------------- */

  private triggerReload(): void {
    this.pageChange$.next({
      page: this.paginatorInput.page,
      pageSize: this.paginatorInput.pageSize
    });
  }

  private updateTableData(data: InvoiceList[]): void {
    this.tableData = data;
    this.datatableService.setData(this.tableData);
  }

  private buildPayload() {

    const offset =
      (this.paginatorInput.page - 1) * this.paginatorInput.pageSize;

    return {
      startDate: this.formatDate(this.daterange.start),
      endDate: this.formatDate(this.daterange.end),
      includeRetries: false,
      offset: offset,
      maxResult: this.paginatorInput.pageSize,
      filter: this.currentTableType,
      issueOnly: false,
      sortBy: 2,
      sortOrder: 'DESC',
      searchText: this.searchValue,
      vendorNames: '',
      countryNames: '',
      partialApprovalFlag: 0
    };
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = d.getFullYear();

    return `${month}/${day}/${year}`;
  }

  /* ---------------- COLUMN FILTERING ---------------- */

  private filterVisibleColumns(): void {
    if (!this.fetched_managecolumn.length) {
      this.datatableService.setColumns(this.tableColumns);
      return;
    }

    const map = new Map<string, { config: ColumnConfig; index: number }>();

    this.fetched_managecolumn.forEach((c, i) => {
      if (c.tabname === 'Invoice Details') {
        map.set(c.displayName, { config: c, index: i });
      }
    });

    const visible: { col: GroupedTableColumns; index: number }[] = [];

    this.tableColumns.forEach((col) => {
      if (!col.columnName) return;

      const entry = map.get(col.columnName);

      if (entry?.config.visible) {
        visible.push({
          col,
          index: entry.index
        });
      }
    });

    visible.sort((a, b) => a.index - b.index);

    this.updated_columns = visible.map((v) => v.col);

    this.datatableService.setColumns(this.updated_columns);
  }

  /* ---------------- STYLE ---------------- */

  private loadExternalStyle(href: string): void {
    if (document.querySelector(`link[href="${href}"]`)) return;

    const link = this.renderer.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    this.injectedStyleLink = link;
    this.renderer.appendChild(document.head, link);
  }

  /* ---------------- CLEANUP ---------------- */

  ngOnDestroy(): void {
    if (this.injectedStyleLink) {
      this.renderer.removeChild(document.head, this.injectedStyleLink);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}