
import { Component, Renderer2, RendererFactory2, OnInit, ViewChild } from '@angular/core';

import { CBCDashboardAPIService } from 'src/app/services/cbcdashboard-api.service';
import { FooterComponent } from '../footer/footer.component';
import { BILLING_ACTIONED_COLUMNS, BILLING_COLUMNS } from 'src/app/config/data-table-columns.config';
import { MOCK_GROUPED_DATA } from 'src/app/mockgrouped';
import { DateRangeService } from 'src/app/services/date-range.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { REMOTE_ENTRY_BASEURL } from 'src/app/constants/constants';
import { ManageColumnService } from 'src/app/services/manage-table-column.service';
import { ColumnConfig } from 'src/app/interface/manage-column.interface';
import { GroupedTableColumns } from 'src/app/interface/data-table-columns.interface';


@Component({
  selector: 'app-cbcdashboard',
  templateUrl: './cbcdashboard.component.html',
  styleUrls: ['./cbcdashboard.component.css']
})


export class CbcdashboardComponent implements OnInit {

  isPaginatorVisible = true;
  tableColumns = BILLING_COLUMNS;
  tableData: any[] = [];
  daterange: any;
  currentTableType: string = 'NONE';
  isAnySelectedOnPage = false;
  selectedRows: any[] = [];

  @ViewChild(FooterComponent) footerComponent!: FooterComponent;

  updated_columns: GroupedTableColumns[] = [];
  fetched_managecolumn: ColumnConfig[] = [];

  // For Pagiation Input
  paginatorInput = {
    page: 10,
    pageSize: 100,
    total: 0,
    pageSizeOption: [100, 200, 300, 400, 500]
  };
  private readonly renderer: Renderer2
  constructor(
    private readonly DashboardApiService: CBCDashboardAPIService,
    private readonly dateRangeService: DateRangeService,
    private readonly datatableService: DataTableService,
    private readonly rendererFactory: RendererFactory2,
    private readonly manageColumnService: ManageColumnService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.loadExternalStyle(REMOTE_ENTRY_BASEURL + 'assets/legacy/Content/cbc-ui.css');

    this.manageColumnService.columns$.subscribe(({ tabname, columns }) => {
      if (tabname == 'Invoice Details') {
        this.fetched_managecolumn = columns;
        this.filterVisibleColumns();
      }
      else if (tabname == 'Order Details') {
        this.manageColumnService.setOrderDetailsUpdatedColumns(columns);
      }
    });

  }


  private filterVisibleColumns() {
    this.updated_columns = this.tableColumns.filter(col => {
      if (!col.columnName) return false;

      const visibilityConfig = this.fetched_managecolumn.find(
        uc => uc.displayName === col.columnName && uc.tabname === 'Invoice Details'
      );

      return visibilityConfig?.visible === true;
    });


    this.updated_columns.sort((a, b) => {
      const aIndex = this.fetched_managecolumn.findIndex(uc => uc.displayName === a.columnName);
      const bIndex = this.fetched_managecolumn.findIndex(uc => uc.displayName === b.columnName);
      return aIndex - bIndex;
    });
    // After filtering and reordering, update the columns in the data table
    this.datatableService.setColumns(this.updated_columns);
    this.datatableService.setData(this.tableData);
  }



  private loadExternalStyle(href: string): void {
    const link = this.renderer.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    this.renderer.appendChild(document.head, link);
  }

  ngAfterViewInit(): void {
    this.dateRangeService.dateRange$.subscribe((Daterange) => {
      if (Daterange) {
        this.daterange = Daterange;
        this.getOrderDetails();
      }
    });
  }



  handlePageChange(page: number, pageSize: number) {
    // this.paginatorInput.page = page;
    // this.paginatorInput.pageSize = pageSize;
    // setTimeout(() => {
    //   this.getOrderDetails();
    // });
  }

  onTabTypeChange(type: string) {


    this.currentTableType = type === 'BillingList' ? 'NONE' : type;

    this.datatableService.setTab(this.currentTableType);

    this.tableColumns = type === 'BillingList' ? BILLING_COLUMNS : BILLING_ACTIONED_COLUMNS;
    this.tableData = [];

    if (this.updated_columns.length > 0) {
      this.updated_columns[this.updated_columns.length - 1] = this.tableColumns[this.tableColumns.length - 1];
    }

    setTimeout(() => {
      this.getOrderDetails();
    });
  }

  private getOrderDetails() {
    //  const start = new Date(this.daterange.start);
    //   const end = new Date(this.daterange.end);

    //   console.log(this.paginatorInput.page);

    //   this.DashboardApiService.getOrdersPage({
    //     fromMonth: start.getMonth() + 1,
    //     fromDay: start.getDate(),
    //     fromYear: start.getFullYear(),
    //     toMonth: end.getMonth() + 1,
    //     toDay: end.getDate(),
    //     toYear: end.getFullYear(),
    //     isSomething: false,
    //    startIndex: (this.paginatorInput.page - 1) * this.paginatorInput.pageSize,

    //     pageSize: this.paginatorInput.pageSize,
    //     sortBy: this.currentTableType,
    //     isFlag: false,
    //     status: 2,
    //     sortDir: 'DESC',
    //     search: '-----',
    //     filter1: 0,
    //     filter2: 0,
    //     filter3: 1
    //   }).subscribe((res: any) => {


    //     const totalCount = res[0]?.totalCount ?? 0;
    //     this.paginatorInput = {
    //       ...this.paginatorInput,
    //       total: totalCount
    //     };

    //     this.tableData = res;




    //     setTimeout(() => {
    //       this.datatableService.setColumns(this.tableColumns);
    //     this.datatableService.setData(this.tableData);
    //   });

    //   }); 


    this.tableData = MOCK_GROUPED_DATA;


    setTimeout(() => {
      if (this.updated_columns.length > 0) {
        this.datatableService.setColumns(this.updated_columns);
      }
      else {
        this.datatableService.setColumns(this.tableColumns);
      }
      this.datatableService.setData(this.tableData);
    });
  }
}