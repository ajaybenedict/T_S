import { S1HeaderConfigService } from './../../core/services/s1-header-config.service';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';
import { DashboardFilterBarHelper } from './dashboard-filter-bar.helper';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ppcFilterButtonDataConfig } from 'src/app/core/config/ppc-side-panel-filter.config';
import { PPCFilterCount, PPCFilterTypeEnum } from 'src/app/models/ppc/ppc-filter.interface';
import { OrderRequest, SortColumnEnum } from 'src/app/models/ppc/order-api.interface';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { SortDirectionEnum } from 'src/app/models/s1/s1-data-table.interface';
import { PPC_CALENDAR_MIN_DAYS, PPC_DASHBOARD_PAGE_SIZE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { customCalendarHeaderButtons } from 'src/app/core/config/s1-custom-date-range-header';

@Component({
  selector: 'app-dashboard-filter-bar',
  templateUrl: './dashboard-filter-bar.component.html',
  styleUrls: ['./dashboard-filter-bar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardFilterBarComponent implements OnInit, OnDestroy, AfterViewInit {

  declare sidepanelFilterCountSubs: Subscription;
  declare panelDismissedSubs: Subscription;
  declare dateRangeExistsSubs: Subscription;
  @ViewChild('anchorBtn', {read: ElementRef}) anchorForPanel!: ElementRef;

  // Initial value
  buttons: { [key in PPCFilterTypeEnum]: S1FilterButtons | null } = {
    ApprovalType: null,
    Country: null,
    OrderValue: null,
  };
  mindays: number = PPC_CALENDAR_MIN_DAYS;
  resetBtn: S1FilterButtons = DashboardFilterBarHelper.getResetButton();
  addfilterBtn: S1FilterButtons = DashboardFilterBarHelper.getAddFilterButton();
  isPanelDismissed: boolean = false;
  ppcFilterTypeEnum = PPCFilterTypeEnum;
  declare filterCount: PPCFilterCount;

  declare fromDate: Date;
  declare toDate: Date;

  private readonly destroy$ = new Subject<void>;

  constructor(
    private readonly dataState: DataState,
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly dashboardApiSVC: PPCDashboardAPIService,
    private readonly s1HeaderConfigSVC : S1HeaderConfigService
  ) { }

  ngOnInit(): void {
    this.initPanelDismissedListener();
    this.initSidePanelFilterCountListener();
    this.initDateRangeHandling();
  }

  private initPanelDismissedListener(): void {
    this.dataState.ppcSidepanelStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: status => this.updatePanelDismissedState(status)
      });
  }
  
  private updatePanelDismissedState(status: string | null): void {
    this.isPanelDismissed = status === 'Closed';
  }

  private initSidePanelFilterCountListener(): void {
    this.dashboardDataSVC.sidepanelFilterCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: counts => this.updateFilterButtons(counts)
      });
  }
  
  private updateFilterButtons(filterCounts: Record<PPCFilterTypeEnum, number>): void {
    this.filterCount = filterCounts;
  
    Object.values(PPCFilterTypeEnum).forEach(type =>
      this.updateFilterButton(type, filterCounts[type])
    );
  }
  
  private updateFilterButton(type: PPCFilterTypeEnum, count: number): void {
    if (count > 0) {
      this.buttons[type] = DashboardFilterBarHelper.generateButtons(ppcFilterButtonDataConfig[type], count);
    } else {
      this.buttons[type] = null;
    }
    this.isPanelDismissed = true;
  }
  
  private initDateRangeHandling(): void {
    const dateRange = this.dashboardDataSVC.getDateRange();
  
    if (dateRange) {
      this.dashboardDataSVC.setQueryContainsDateRange(true);
    }
  
    this.dashboardDataSVC.queryContainsDateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: contains => {
          if (contains && dateRange) {
            this.applyDateRange(dateRange);
          }
        }
      });
  }
  
  private applyDateRange(dateRange: { fromDate: Date; toDate: Date }): void {
    this.fromDate = dateRange.fromDate;
    this.toDate = dateRange.toDate;
  
    if (this.isCustomRange(this.fromDate, this.toDate)) {
      this.updateCalendarHeaderForCustomRange();
      this.dashboardDataSVC.setQueryContainsDateRange(false);
    }
  }

  private updateCalendarHeaderForCustomRange(): void {
    const updatedButtons = customCalendarHeaderButtons.map(btn => {
      let selected = btn.selected;
      if (btn.id === 'custom') {
        selected = true;
      } else if (btn.id === '7D') {
        selected = false;
      }
    
      return {
        ...btn,
        selected
      };
    }); 
    this.s1HeaderConfigSVC.setButtons(updatedButtons);
  }
  
  isCustomRange(from: Date, to: Date, defaultDays = 7): boolean {
    const today = this.stripTime(new Date());
    const defaultFrom = this.stripTime(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - defaultDays)
    );

    return (
      this.stripTime(from).getTime() !== defaultFrom.getTime() ||
      this.stripTime(to).getTime() !== today.getTime()
    );
  }

  private stripTime(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  ngAfterViewInit(): void {
    this.dataState.setPPCFilterPanelAnchorElement(this.anchorForPanel)
  }

  btnClickHandler(event: string) {
    switch (event) {
      case 'AddFilter':
        this.dashboardDataSVC.setSelectedFilterType('');
        break;
      case 'ResetFilter':
        this.resetBtnData();
        this.dashboardDataSVC.setSelectedFilterType('');
        break;
      default:
        this.dashboardDataSVC.setSelectedFilterType(event);
        break;
    }
  }

  closeBtnHandler(event: string) {
    this.resetBtnData(event);
  }

  resetBtnData(type: string = '') {
    let dataToSend = this.dashboardDataSVC.getOrderRequestData();
    switch (type) {
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.ApprovalType].onClickEvent:
        this.clearApprovalBtn();
        dataToSend = { ...dataToSend, ApprovalTypeFilter: 0, ApprovalType: [] };
        this.getOrderDetails(dataToSend);
        break;
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.Country].onClickEvent:
        this.clearCountryBtn();
        dataToSend = { ...dataToSend, CountryFilter: 0, Country: [] };
        this.getOrderDetails(dataToSend);
        break;
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.OrderValue].onClickEvent:
        this.clearOrderValueBtn();
        dataToSend = { ...dataToSend, AmountFilter: 0, AmountMax: 0, AmountMin: 0 };
        this.getOrderDetails(dataToSend);
        break;
      default:
        // resetAll
        this.clearApprovalBtn();
        this.clearCountryBtn();
        this.clearOrderValueBtn();
        dataToSend = { ...dataToSend, ApprovalTypeFilter: 0, ApprovalType: [], CountryFilter: 0, Country: [], AmountFilter: 0, AmountMax: 0, AmountMin: 0, PageIndex: 0 };
        this.getOrderDetails(dataToSend);
        break;
    }
  }

  private clearApprovalBtn() {
    this.dashboardDataSVC.setSelectedApprovalType(null);
    this.updateCount({ ApprovalType: 0 });
  }

  private clearCountryBtn() {
    this.dashboardDataSVC.setSelectedCountry(null);
    this.updateCount({ Country: 0 });
  }

  private clearOrderValueBtn() {
    this.dashboardDataSVC.setSelectedOrderValue(null);
    this.updateCount({ OrderValue: 0 });
  }

  private updateCount(data: Partial<PPCFilterCount>) {
    this.filterCount = { ...this.filterCount, ...data };
    this.dashboardDataSVC.setSidepanelFilterCount(this.filterCount);
  }

  dateRangeEventHandler(data: { [key: string]: string }) {
    // when a user chooses the 'custom' date range, first value will be the same start & end date. To catch that we use this logic here
    if (data['start'] == data['end']) return;    
    let dateFilter: Partial<OrderRequest> = {
      OrderFromDate: data['start'],
      OrderToDate: data['end'],      
      OrderByColumn: SortColumnEnum.ORDERDETAILS,
      SortOrder: SortDirectionEnum.DESCENDING
    };
    this.getOrderDetails(dateFilter);
  }

  private getOrderDetails(data: Partial<OrderRequest>) {
    this.dashboardDataSVC.setOrderAPIInProgress(true);
    let dataToSend = this.dashboardDataSVC.getOrderRequestData();
    dataToSend = { ...dataToSend, ...data, PageIndex: 0, PageSize: PPC_DASHBOARD_PAGE_SIZE };
    this.dashboardDataSVC.setOrderRequestData(dataToSend);
    this.dashboardApiSVC.getOrders(dataToSend).subscribe({
      next: res => {
        this.dashboardDataSVC.setOrderResponseData(res);
        this.dashboardDataSVC.setOrderAPIInProgress(false);
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
