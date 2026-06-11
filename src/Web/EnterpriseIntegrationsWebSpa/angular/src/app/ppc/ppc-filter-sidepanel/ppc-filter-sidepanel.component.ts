import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';
import { S1DescriptionCheckbox, S1GroupCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';
import { S1FilterNumericFieldInput, S1FilterNumericFieldOutput } from 'src/app/models/s1/s1-filter-numeric-field.interface';
import { SidePanelHelper } from './side-panel.helper';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { Subject, takeUntil } from 'rxjs';
import { ppcFilterButtonDataConfig } from 'src/app/core/config/ppc-side-panel-filter.config';
import { PPCFilterCount, PPCFilterTypeEnum } from 'src/app/models/ppc/ppc-filter.interface';
import { OrderRequest } from 'src/app/models/ppc/order-api.interface';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPC_DASHBOARD_PAGE_SIZE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { CountryRegionResponse } from 'src/app/models/ppc/country-region-api.interface';

@Component({
  selector: 'app-ppc-filter-sidepanel',
  templateUrl: './ppc-filter-sidepanel.component.html',
  styleUrls: ['./ppc-filter-sidepanel.component.css'],
  standalone: false,
})
export class PpcFilterSidepanelComponent implements OnInit, OnDestroy {

  @ViewChild('drawer') declare sidepanel: MatDrawer;
  // Template InputData
  buttons: { [key in PPCFilterTypeEnum]: S1FilterButtons} = SidePanelHelper.getButtons();
  approvalTypeCheckbox: S1DescriptionCheckbox[] = SidePanelHelper.getApprovalTypeData();
  billingTermCheckbox: S1DescriptionCheckbox[] = SidePanelHelper.getBillingTermData();
  resellerStatusCheckbox: S1DescriptionCheckbox[] = SidePanelHelper.getResellerStatusData();
  orderValueData: S1FilterNumericFieldInput = SidePanelHelper.getMinMaxData();    
  btnList!: S1FilterButtons[];
  selectedFilter!: string;  
  // Config Data
  filterConfigData = ppcFilterButtonDataConfig;
  filterEnum = PPCFilterTypeEnum;  
  // Country Region API Data & Subs
  countryRegionCheckbox!: S1GroupCheckbox[];      
  // Local variables maintained in this component alone until 'Apply' click
  // Null is maintained for making the reset functionality easy.  
  filterCount: PPCFilterCount = {
    ApprovalType: 0,
    Country: 0,
    OrderValue: 0,
    BillingTerm: 0,
    ResellerStatus: 0,
  };

  private readonly destroy$ = new Subject<void>();
    
  constructor(
    private readonly dataState: DataState,
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly dashboardApiSVC: PPCDashboardAPIService,
  ) { }

  ngOnInit(): void {
    this.subscribeCountryRegionData();
    this.subscribeOrderValue();
    this.subscribeApprovalType();
    this.subscribeCountry();
    this.subscribeBillingTerm();
    this.subscribeResellerStatus();
    this.subscribeSidepanelFilterCount();
  
    this.setSelectedFilter();
  }

  private buildCountryGroups(res: CountryRegionResponse[], selectedIds: number[]): S1GroupCheckbox[] {
    let groups = SidePanelHelper.mapCountryApiToGroupCheckbox(res);
    return SidePanelHelper.applySelectedCountries(groups, selectedIds);
  }

  private cloneCountryGroups(groups: S1GroupCheckbox[]): S1GroupCheckbox[] {
    return groups.map(group => ({
      ...group,
      checkboxes: group.checkboxes.map(cb => ({ ...cb }))
    }));
  }
   
  private resolveApprovalTypeData(res: S1DescriptionCheckbox[] | null): S1DescriptionCheckbox[] | null {
    if (res?.length) {
      return res.map(item => ({ ...item }));
    }
  
    const queryTypes = this.dashboardDataSVC.getApprovalTypes();
    if (queryTypes?.length) {
      return SidePanelHelper.getSelectedApprovalTypeData(queryTypes);
    }
  
    return null;
  }

  private updateFilterCount(partial: Partial<PPCFilterCount>): void {
    this.filterCount = {
      ...this.filterCount,
      ...partial
    };
  
    this.dashboardDataSVC.setSidepanelFilterCount({ ...this.filterCount });
  }
    
  private updateCountryFilterCount(count: number): void {
    this.updateFilterCount({ Country: count });
  }
  
  private updateOrderValueFilterCount(hasValue: boolean | null): void {
    this.updateFilterCount({ OrderValue: hasValue ? 1 : 0 });
  }
  
  private updateApprovalTypeFilterCount(
    data: S1DescriptionCheckbox[]
  ): void {
    const count = data.filter(el => el.checked).length;
    this.updateFilterCount({ ApprovalType: count });
  }

  /**
   * Updates the filter count for billing term (mutually exclusive, so max 1).
   */
  private updateBillingTermFilterCount(data: S1DescriptionCheckbox[]): void {
    const count = data.filter(item => item.checked).length;
    this.updateFilterCount({ BillingTerm: count });
  }

  /**
   * Updates the filter count for reseller status (can be multiple selections).
   */
  private updateResellerStatusFilterCount(data: S1DescriptionCheckbox[]): void {
    const count = data.filter(item => item.checked).length;
    this.updateFilterCount({ ResellerStatus: count });
  }
  
  private subscribeCountryRegionData(): void {
      this.dashboardDataSVC.countryRegionData$.pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (!res) {
          return;
        }
  
        const selectedIds =
          this.dashboardDataSVC.getOrderRequestData()?.Country ?? [];
  
        const groups = this.buildCountryGroups(res, selectedIds);
  
        this.countryRegionCheckbox = groups;
  
        this.updateCountryFilterCount(selectedIds.length);
      });
  }
  
  private subscribeOrderValue(): void {
    this.dashboardDataSVC.selectedOrderValue$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.updateOrderValue(res);
      this.updateOrderValueFilterCount(res && res.min > 0);
    });
  }
  
  private subscribeApprovalType(): void {
    this.dashboardDataSVC.selectedApprovalType$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      const updatedData = this.resolveApprovalTypeData(res);
  
        if (!updatedData) {
          return;
        }
  
        this.updateApprovalType(updatedData);
        this.updateApprovalTypeFilterCount(updatedData);
      });
  }
  
  private subscribeCountry(): void {
    this.dashboardDataSVC.selectedCountry$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (!res?.length) {
        return;
      }

      this.updateCountry(this.cloneCountryGroups(res));
    });
  }

  /**
   * Subscribe to billing term filter state.
   * Standard/Multi-Year are mutually exclusive.
   */
  private subscribeBillingTerm(): void {
    this.dashboardDataSVC.selectedBillingTerm$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      const updatedData = this.resolveBillingTermData(res);
      if (!updatedData) {
        return;
      }
      this.updateBillingTerm(updatedData);
      this.updateBillingTermFilterCount(updatedData);
    });
  }

  /**
   * Subscribe to reseller status filter state.
   * On Hold and Discontinued are independent selections.
   */
  private subscribeResellerStatus(): void {
    this.dashboardDataSVC.selectedResellerStatus$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      const updatedData = this.resolveResellerStatusData(res);
      if (!updatedData) {
        return;
      }
      this.updateResellerStatus(updatedData);
      this.updateResellerStatusFilterCount(updatedData);
    });
  }

  private subscribeSidepanelFilterCount(): void {
    this.dashboardDataSVC.sidepanelFilterCount$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.updateButtons(res);
    });
  }  
  
  dismissPanel() {
    this.dataState.setPPCSidepanelStatus('Closed');
  }

  private initButtons() {
    this.btnList = [ ...Object.values(this.buttons)];
  }

  private updateButtons(data: Partial<PPCFilterCount>) {        
    this.filterCount = {...this.filterCount, ...data};
    this.buttons = SidePanelHelper.updateButtons(this.buttons, this.filterCount);    
    this.initButtons();
  }

  private updateOrderValue(data: S1FilterNumericFieldOutput | null) {
    if(data) {
      this.orderValueData = {
        ...this.orderValueData,
        min: data.min,
        max: data.max,
      };         
    } else {          
      this.orderValueData = {
        ...this.orderValueData,
        min: 0,
        max: 0,
      };
    }
  }

  private updateApprovalType(data: S1DescriptionCheckbox[] | null) {
    if(data) {
      //  map used in order to avoid mutation issue of nested object
      this.approvalTypeCheckbox = data.map(item => ({ ...item }));          
    } else {      
      this.approvalTypeCheckbox.forEach(el => el.checked = false);
    }
  }

  /**
   * Resolves billing term filter data from service state or defaults.
   */
  private resolveBillingTermData(res: S1DescriptionCheckbox[] | null): S1DescriptionCheckbox[] | null {
    if (res?.length) {
      return res.map(item => ({ ...item }));
    }

    const selectedTerms = this.dashboardDataSVC.getOrderRequestData() ?
      SidePanelHelper.getSelectedBillingTermsFromRequest({
        MultiYearContractFilter: this.dashboardDataSVC.getOrderRequestData().MultiYearContractFilter,
        MultiYearContract: this.dashboardDataSVC.getOrderRequestData().MultiYearContract,
      }) : [];

    if (selectedTerms?.length) {
      return SidePanelHelper.getSelectedBillingTermData(selectedTerms);
    }

    return null;
  }

  /**
   * Resolves reseller status filter data from service state or defaults.
   */
  private resolveResellerStatusData(res: S1DescriptionCheckbox[] | null): S1DescriptionCheckbox[] | null {
    if (res?.length) {
      return res.map(item => ({ ...item }));
    }

    const selectedStatuses = this.dashboardDataSVC.getOrderRequestData() ?
      SidePanelHelper.getSelectedResellerStatusesFromRequest({
        OnHoldFilter: this.dashboardDataSVC.getOrderRequestData().OnHoldFilter,
        OnHold: this.dashboardDataSVC.getOrderRequestData().OnHold,
        DiscontinuedFilter: this.dashboardDataSVC.getOrderRequestData().DiscontinuedFilter,
        Discontinued: this.dashboardDataSVC.getOrderRequestData().Discontinued,
      }) : [];

    if (selectedStatuses?.length) {
      return SidePanelHelper.getSelectedResellerStatusData(selectedStatuses);
    }

    return null;
  }

  /**
   * Updates billing term checkbox state with proper mutation handling.
   */
  private updateBillingTerm(data: S1DescriptionCheckbox[] | null) {
    if (data) {
      this.billingTermCheckbox = data.map(item => ({ ...item }));
    } else {
      this.billingTermCheckbox.forEach(el => el.checked = false);
    }
  }

  /**
   * Updates reseller status checkbox state with proper mutation handling.
   */
  private updateResellerStatus(data: S1DescriptionCheckbox[] | null) {
    if (data) {
      this.resellerStatusCheckbox = data.map(item => ({ ...item }));
    } else {
      this.resellerStatusCheckbox.forEach(el => el.checked = false);
    }
  }

  private updateCountry(data: S1GroupCheckbox[] | null) {
    //  map used in order to avoid mutation issue of nested object
    // also map will create new object and triggers change detection in child component.
    if (data) {
      this.countryRegionCheckbox = data.map(group => ({
        ...group,
        checkboxes: group.checkboxes.map(cb => ({ ...cb }))
      }));
    } else {
      this.countryRegionCheckbox = this.countryRegionCheckbox.map(group => ({
        ...group,
        checkboxes: group.checkboxes.map(cb => ({ ...cb, checked: false }))
      }));
    }
  }

  private setSelectedFilter() {    
    const filterType = this.dashboardDataSVC.getSelectedFilterType();
    this.selectedFilter = (filterType === '' || filterType == null) ? ppcFilterButtonDataConfig[this.filterEnum.Country].onClickEvent : filterType;
    const type = this.selectedFilter as keyof typeof PPCFilterTypeEnum;    
    this.buttons[type].selected = true;
    this.initButtons();
  }

  reset() {    
    this.resetBtnData();    
  }

  btnContainerClickEventHandler(btn: S1FilterButtons | string): void {
    if (this.isValidFilterButton(btn)) {
      this.selectedFilter = btn.onClickEvent!;
    } else if (typeof btn === 'string') {
      this.closeBtnHandler(btn);
    }
  }

  private isValidFilterButton(btn: S1FilterButtons | string): btn is S1FilterButtons & { onClickEvent: string } {
    return typeof btn === 'object' && typeof btn.onClickEvent === 'string';
  }

  orderValueEventHandler(data: S1FilterNumericFieldOutput) {      
    this.updateButtons({OrderValue: 1});
    this.updateOrderValue(data);         
  }

  regionCountryEventHandler(data: S1GroupCheckbox) {
    const index = this.countryRegionCheckbox.findIndex(item => item.id == data.id);
    if (index == -1) return;
    //  map used in order to avoid mutation issue of nested object
    this.countryRegionCheckbox[index] = {
      ...data,
      checkboxes: data.checkboxes.map(cb => ({ ...cb }))
    };
    // Calculate total selected countries across all regions
    const totalSelectedCount = this.countryRegionCheckbox.reduce((count, group) => {
      return count + group.checkboxes.filter(cb => cb.checked).length;
    }, 0);    
    this.updateButtons({ Country: totalSelectedCount });
  }

  approvalTypeEventHandler(data: S1DescriptionCheckbox[]) {        
    const selectedCount = data.filter(el => el.checked).length;    
    this.updateButtons({ApprovalType: selectedCount});
    this.updateApprovalType(data);
  }

  /**
   * Handles billing term filter selection with mutual exclusivity enforcement.
   */
  billingTermEventHandler(data: S1DescriptionCheckbox[]) {
    const normalizedData = SidePanelHelper.enforceExclusiveBillingTermSelection(
      this.billingTermCheckbox,
      data,
    );
    const selectedCount = normalizedData.filter(item => item.checked).length;

    this.updateButtons({ BillingTerm: selectedCount });
    this.updateBillingTerm(normalizedData);
  }

  /**
   * Handles reseller status filter selection (independent flags, no mutual exclusivity).
   */
  resellerStatusEventHandler(data: S1DescriptionCheckbox[]) {
    const selectedCount = data.filter(item => item.checked).length;

    this.updateButtons({ ResellerStatus: selectedCount });
    this.updateResellerStatus(data);
  }

  /**
   * Handles close button clicks on filter chips.
   */
  closeBtnHandler(event: string) {
    this.resetBtnData(event);
  }

  private resetBtnData(type: string = '') {        
    switch(type) {
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.ApprovalType].onClickEvent:        
          this.clearApprovalBtn();
        break;
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.Country].onClickEvent:        
          this.clearCountryBtn();
        break;
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.OrderValue].onClickEvent:        
          this.clearOrderValueBtn();
        break;
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.BillingTerm].onClickEvent:
          this.clearBillingTermBtn();
        break;
      case ppcFilterButtonDataConfig[PPCFilterTypeEnum.ResellerStatus].onClickEvent:
          this.clearResellerStatusBtn();
        break;
      default:        
        // resetAll
        this.resetAll();
        this.dashboardDataSVC.setSelectedFilterType('')
        break;     
    }
  }

  private resetAll() {
    this.clearApprovalBtn();
    this.clearCountryBtn();
    this.clearOrderValueBtn();
    this.clearBillingTermBtn();
    this.clearResellerStatusBtn();
    this.applyFilter();
  }

  private clearApprovalBtn() {             
    this.updateButtons({ApprovalType: 0});
    this.updateApprovalType(null);  
  }

  private clearCountryBtn() {          
    this.updateButtons({Country: 0});
    this.updateCountry(null);    
  }

  private clearOrderValueBtn() {        
    this.updateButtons({OrderValue: 0});
    this.updateOrderValue(null);
  }

  /**
   * Clears billing term filter selection.
   */
  private clearBillingTermBtn() {
    this.updateButtons({ BillingTerm: 0 });
    this.updateBillingTerm(null);
  }

  /**
   * Clears reseller status filter selection.
   */
  private clearResellerStatusBtn() {
    this.updateButtons({ ResellerStatus: 0 });
    this.updateResellerStatus(null);
  }

  private getOrderDetails(data: Partial<OrderRequest>) {
    let datatoSend: OrderRequest = this.dashboardDataSVC.getOrderRequestData();
    datatoSend = {...datatoSend, ...data}
    this.dashboardDataSVC.setOrderRequestData(datatoSend);
    this.dashboardDataSVC.setOrderAPIInProgress(true);
    this.dashboardApiSVC.getOrders(datatoSend).subscribe({
      next: res => {
        this.dashboardDataSVC.setOrderAPIInProgress(false);
        this.dashboardDataSVC.setOrderResponseData(res);
      }
    });
  }

  applyFilter() {
    // Save filter selections to service state
    this.dashboardDataSVC.setSelectedApprovalType(this.approvalTypeCheckbox.map(item => ({ ...item })));
    this.dashboardDataSVC.setSelectedCountry(this.cloneCountryGroups(this.countryRegionCheckbox ?? []));
    this.dashboardDataSVC.setSelectedBillingTerm(this.billingTermCheckbox.map(item => ({ ...item })));
    this.dashboardDataSVC.setSelectedResellerStatus(this.resellerStatusCheckbox.map(item => ({ ...item })));
    this.dashboardDataSVC.setSelectedOrderValue({ ...this.orderValueData });
    this.dashboardDataSVC.setSidepanelFilterCount({ ...this.filterCount });

    // Prepare order request data
    const isCountrySelected = this.filterCount[PPCFilterTypeEnum.Country] > 0 ? 1 : 0;
    const isApprovalTypeSelected = this.filterCount[PPCFilterTypeEnum.ApprovalType] > 0 ? 1 : 0;
    const isOrderValueSelected = this.filterCount[PPCFilterTypeEnum.OrderValue] > 0 ? 1 : 0;

    // Extract selected country IDs
    const selectedCountryKeys = this.countryRegionCheckbox
      .flatMap(group =>
        group.checkboxes
          .filter(checkbox => checkbox.checked)
          .map(checkbox => typeof checkbox.key === 'string' ? Number.parseInt(checkbox.key) : checkbox.key)
      );

    // Extract selected approval type keys
    const selectedApprovalTypeKeys = this.approvalTypeCheckbox
      .filter(el => el.checked)
      .map(el => typeof el.key === 'string' ? Number.parseInt(el.key) : el.key);

    // Extract billing term and reseller status selections
    const selectedBillingTerms = SidePanelHelper.getSelectedBillingTerms(this.billingTermCheckbox);
    const selectedResellerStatuses = SidePanelHelper.getSelectedResellerStatuses(this.resellerStatusCheckbox);

    // Build request payload with separate filters for billing term and reseller status
    const dataToSend: Partial<OrderRequest> = {
      ApprovalTypeFilter: isApprovalTypeSelected,
      ApprovalType: selectedApprovalTypeKeys,
      CountryFilter: isCountrySelected,
      Country: selectedCountryKeys,
      AmountFilter: isOrderValueSelected,
      AmountMax: this.orderValueData.max,
      AmountMin: this.orderValueData.min,
      ...SidePanelHelper.buildBillingTermRequest(selectedBillingTerms),
      ...SidePanelHelper.buildResellerStatusRequest(selectedResellerStatuses),
      PageIndex: 0,
      PageSize: PPC_DASHBOARD_PAGE_SIZE,
    };
    this.getOrderDetails(dataToSend);
  }

  ngOnDestroy(): void {    
    this.destroy$.next();
    this.destroy$.complete();
  }
}
