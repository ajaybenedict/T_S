import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { OrderRequest, OrderResponse, SortColumnEnum } from "src/app/models/ppc/order-api.interface";
import { DEFAULT_PREVIOUS_DAYS_FILTER } from "../constants/constants";
import { CountryRegionResponse } from "src/app/models/ppc/country-region-api.interface";
import { S1FilterNumericFieldOutput } from "src/app/models/s1/s1-filter-numeric-field.interface";
import { S1DescriptionCheckbox, S1GroupCheckbox } from "src/app/models/s1/s1-filter-checkbox.interface";
import { PPCFilterCount, PPCFilterTypeEnum } from "src/app/models/ppc/ppc-filter.interface";
import { ppcFilterButtonDataConfig } from "../config/ppc-side-panel-filter.config";
import { SortDirectionEnum } from "src/app/models/s1/s1-data-table.interface";
import { cloneDeep } from "lodash";
import { customCalendarHeaderButtons } from "../config/s1-custom-date-range-header";
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';
import { SidePanelHelper } from "src/app/ppc/ppc-filter-sidepanel/side-panel.helper";

@Injectable({providedIn: "root"})

export class PPCDashboardDataService {

    constructor(
      private readonly location: Location,
      private readonly route: ActivatedRoute
    ) {}

    private previousNumberOfDays: number = DEFAULT_PREVIOUS_DAYS_FILTER;
    // Default selected filter when side panel is open
    private selectedFilterType: string = ppcFilterButtonDataConfig[PPCFilterTypeEnum.Country].onClickEvent;

    private readonly today = new Date();
    private readonly fromDate = new Date(new Date().setDate(this.today.getDate() - this.previousNumberOfDays));
    private readonly toDate = this.today;

    // Default initial request and will be modified over time by other components
    private orderRequestData: OrderRequest = {
      AmountFilter: 0,
      AmountMax: 0,
      AmountMin: 0,
      ApprovalType: [],
      ApprovalTypeFilter: 0,
      ApprovalTypeValues: [],
      Country: [],
      CountryFilter: 0,
      CountryValues: [],
      DateFilterType: 'custom',
      OrderFromDate: this.fromDate.toISOString().split('T')[0],
      OrderToDate: this.toDate.toISOString().split('T')[0],
      PageIndex: 0,
      PageSize: 10,
      Region: [],
      RegionFilter: 0,
      RegionValues: [],
      TextSearch: 0,
      SearchText: '',
      OrderByColumn: SortColumnEnum.ORDERDETAILS,
      SortOrder: SortDirectionEnum.DESCENDING,
      Status: '1,2,3,5,7',
      StatusFilter: 1,
    };

    ppcFilterCount: PPCFilterCount = {
        ApprovalType: 0,
        Country: 0,
        OrderValue: 0,
    }

    // Order API
    private readonly orderResponseData = new BehaviorSubject<OrderResponse[] | null>(null);
    private readonly orderAPIInProgress = new BehaviorSubject<boolean>(false);
    private readonly orderAPIFailed = new BehaviorSubject<boolean>(false);
    // Country API
    private readonly countryRegionData = new BehaviorSubject<CountryRegionResponse[] | null>(null);
    // Filters - Data
    private readonly selectedOrderValue = new BehaviorSubject<S1FilterNumericFieldOutput | null>(null);
    private readonly selectedApprovalType = new BehaviorSubject<S1DescriptionCheckbox[] | null>(null);
    private readonly selectedCountry = new BehaviorSubject<S1GroupCheckbox[] | null>(null);
    // Filters - Count
    private readonly sidepanelFilterCount = new BehaviorSubject<PPCFilterCount>(this.ppcFilterCount);
    // active tab id
    private readonly activeTabId = new BehaviorSubject<number>(0);
    // date range
    private readonly queryContainsDateRange = new BehaviorSubject<boolean>(false);

    // Order API
    orderResponseData$ = this.orderResponseData.asObservable();
    orderAPIInProgress$ = this.orderAPIInProgress.asObservable();
    orderAPIFailed$ = this.orderAPIFailed.asObservable();
    // Country API
    countryRegionData$ = this.countryRegionData.asObservable();
    // Filters - Data
    selectedOrderValue$ = this.selectedOrderValue.asObservable();
    selectedApprovalType$ = this.selectedApprovalType.asObservable();
    selectedCountry$ = this.selectedCountry.asObservable();
    // Filters - Count
    sidepanelFilterCount$ = this.sidepanelFilterCount.asObservable();
    // active tab id
    activeTabId$ = this.activeTabId.asObservable();
    queryContainsDateRange$ = this.queryContainsDateRange.asObservable();


    getOrderRequestData() {
        return this.orderRequestData;
    }

    setOrderRequestData(value: Partial<OrderRequest>) {
        let temp: OrderRequest = {...this.orderRequestData, ...value};
        this.orderRequestData = temp;
    }

    getPreviousNumberOfDays() {
        return this.previousNumberOfDays;
    }

    setPreviousNumberOfDays(value: number) {
        this.previousNumberOfDays = value;
    }

    getSelectedFilterType() {
        return this.selectedFilterType;
    }

    setSelectedFilterType(value: string) {
        this.selectedFilterType = value;
    }

    setOrderResponseData(value: OrderResponse[] | null) {
        this.orderResponseData.next(value);
    }

    setOrderAPIInProgress(value: boolean) {
        this.orderAPIInProgress.next(value);
    }

    setOrderAPIFailed(value: boolean) {
        this.orderAPIFailed.next(value);
    }

    setCountryRegionData(value: CountryRegionResponse[]) {
        this.countryRegionData.next(value);
    }

    setSelectedOrderValue(value: S1FilterNumericFieldOutput | null) {
        this.selectedOrderValue.next(value);
    }

    setSelectedApprovalType(value: S1DescriptionCheckbox[] | null) {
        this.selectedApprovalType.next(value);
    }

    setSelectedCountry(value: S1GroupCheckbox[] | null) {
        this.selectedCountry.next(value);
    }

    setSidepanelFilterCount(value: PPCFilterCount) {
        this.sidepanelFilterCount.next(value);
    }

    setDefaultDaterangeHeader() {
        customCalendarHeaderButtons.forEach(el => el.selected = false);
        const defaultEl = customCalendarHeaderButtons.find(el => el.days == DEFAULT_PREVIOUS_DAYS_FILTER);
        if(!defaultEl) return;
        defaultEl.selected = true;
    }

    setActiveTabId(value: number) {
        this.activeTabId.next(value);
    }

    setQueryContainsDateRange(value: boolean) {
        this.queryContainsDateRange.next(value);
    }

    buildOrderRequestDataFromQuery(): OrderRequest {
      const orderId = this.getOrderId();
      const tabId = this.getTabId();
      const dateRange = this.getDateRange();
      const amountRange = this.getAmountRange();
      const approvalTypes = this.getApprovalTypes();
      const countryIds = this.getCountryIds();
      const min = amountRange ? amountRange.min : 0;
      const max = amountRange ? amountRange.max : 0;

      this.setSelectedOrderValue(SidePanelHelper.getMinMaxData(min, max));

      this.setActiveTabId(tabId);

      const request: OrderRequest = {
        ...this.orderRequestData,

        SearchText: orderId,
        TextSearch: this.enableSearchTextFilter(orderId),

        Status: this.getStatusByTab(tabId),

        ApprovalType: approvalTypes,
        ApprovalTypeFilter: this.enableApprovalTypeFilter(approvalTypes),

        Country: countryIds,
        CountryFilter: this.enableCountryFilter(countryIds),

        OrderFromDate: this.formatDate(dateRange.fromDate),
        OrderToDate: this.formatDate(dateRange.toDate),

        AmountMin: min,
        AmountMax: max,
        AmountFilter: this.enableAmountFilter(min, max),
      };

      return cloneDeep(request);
    }

    parseNumberArray(value?: string): number[] {
      if (!value) {
        return [];
      }
      return value.split(',').map(Number).filter(Number.isInteger);
    }

    enableSearchTextFilter(orderId: string) : 0 | 1 {
      return orderId ? 1 : 0;
    }

    enableApprovalTypeFilter(approvalTypes: number[]) : 0 | 1 {
      return approvalTypes.length > 0 ? 1 : 0;
    }

    enableCountryFilter(countryIds: number[]) : 0 | 1 {
      return countryIds.length > 0 ? 1 : 0;
    }

    enableAmountFilter(min: number, max: number) : 0 | 1 {
      return (min > 0 || max > 0) ? 1 : 0;
    }

    getCountryIds(): number[] {
      let params = this.route.snapshot.queryParams
      return this.parseNumberArray(params['country']);
    }

    getOrderId(): string {
      let params = this.route.snapshot.queryParams
      return params['orderId'] ?? '';
    }

    getTabId(): number {
      let params = this.route.snapshot.queryParams
      return this.getValidTabId(params['tab']);
    }

    getValidTabId(tab?: string): number {
      const parsed = Number(tab);
      return Number.isInteger(parsed) && parsed < 3 ? parsed : 0;
    }

    getAmountRange(): { min: number; max: number; hasFilter: boolean; } {
      let params = this.route.snapshot.queryParams
      const min = Number(params['minAmount']) || 0;
      const max = Number(params['maxAmount']) || 0;
      return { min, max, hasFilter: min > 0 || max > 0 };
    }

    getApprovalTypes(): number[] {
      let params = this.route.snapshot.queryParams
      return this.parseNumberArray(params['approvalTypes']);
    }

    getDateRange(): { fromDate: Date; toDate: Date } {
      const params = this.route.snapshot.queryParams;

      const today = this.stripTime(new Date());

      const minDate = this.getDateMinusDays(today, 90);
      const maxDate = today;

      const defaultFromDate = this.stripTime(
        this.getDateMinusDays(today, 7)
      );
      const defaultToDate = today;

      const rawFromDate =
        this.parseDate(params['startDate']) ?? defaultFromDate;

      const rawToDate =
        this.parseDate(params['endDate']) ?? defaultToDate;

      const fromDate = this.clampDate(rawFromDate, minDate, maxDate);
      const toDate = this.clampDate(rawToDate, minDate, maxDate);

      // ensure logical order
      if (fromDate > toDate) {
        return {
          fromDate: defaultFromDate,
          toDate: defaultToDate
        };
      }

      return { fromDate, toDate };
    }

    private clampDate(date: Date, min: Date, max: Date): Date {
      if (date < min) return min;
      if (date > max) return max;
      return date;
    }

    private getDateMinusDays(base: Date, days: number): Date {
      const d = new Date(base);
      d.setDate(d.getDate() - days);
      return d;
    }

    private parseDate(value?: string | Date): Date | null {
      if (!value) return null;

      if (value instanceof Date) {
        return this.stripTime(value);
      }

      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    private stripTime(date: Date): Date {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    formatDate(date: Date): string {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    getStatusByTab(tabId: number): string {
      const STATUS_MAP: Record<number, string> = {
        1: '6,8,9', // Approved
        2: '10',    // Declined
      };

      return STATUS_MAP[tabId] ?? '1,2,3,5,7';
    }

    clearQueryParamsFromUrl(): void {
      const urlWithoutQuery = this.location.path().split('?')[0];
      this.location.replaceState(urlWithoutQuery);
    }
}