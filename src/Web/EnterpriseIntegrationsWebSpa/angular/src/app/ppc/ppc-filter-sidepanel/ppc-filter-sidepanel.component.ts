import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';
import { S1DescriptionCheckbox, S1GroupCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';
import { S1FilterNumericFieldInput, S1FilterNumericFieldOutput } from 'src/app/models/s1/s1-filter-numeric-field.interface';
import { SidePanelHelper } from './side-panel.helper';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { Subscription } from 'rxjs';
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
  orderValueData: S1FilterNumericFieldInput = SidePanelHelper.getMinMaxData();    
  declare btnList: S1FilterButtons[];
  declare selectedFilter: string;  
  // Config Data
  filterConfigData = ppcFilterButtonDataConfig;
  filterEnum = PPCFilterTypeEnum;  
  // Country Region API Data & Subs
  declare countryRegionCheckbox: S1GroupCheckbox[];
  declare countryRegionDataSubs: Subscription;
  // Subs for Filters - Data
  declare selectedOrderValueSubs: Subscription;
  declare selectedApprovalTypeSubs: Subscription;
  declare selectedCountrySubs: Subscription;
  // Subs for Filter - Count
  declare sidepanelFilterCountSubs: Subscription;
  // Local variables maintained in this component alone until 'Apply' click
  // Null is maintained for making the reset functionality easy.  
  filterCount: PPCFilterCount = {
    ApprovalType: 0,
    Country: 0,
    OrderValue: 0,
  };
    
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
  
  private mergeAmountRange(res: S1FilterNumericFieldOutput | null , amount: { min: number; max: number } | null): S1FilterNumericFieldOutput | null  {
    if (!amount) {
      return res;
    }
  
    return {
      ...res,
      min: amount.min,
      max: amount.max
    };
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
  
  private subscribeCountryRegionData(): void {
    this.countryRegionDataSubs =
      this.dashboardDataSVC.countryRegionData$.subscribe(res => {
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
    this.selectedOrderValueSubs =
      this.dashboardDataSVC.selectedOrderValue$.subscribe(res => {
        this.updateOrderValue(res);
        this.updateOrderValueFilterCount(res && res.min > 0);
      });
  }
  
  private subscribeApprovalType(): void {
    this.selectedApprovalTypeSubs =
      this.dashboardDataSVC.selectedApprovalType$.subscribe(res => {
        const updatedData = this.resolveApprovalTypeData(res);
  
        if (!updatedData) {
          return;
        }
  
        this.updateApprovalType(updatedData);
        this.updateApprovalTypeFilterCount(updatedData);
      });
  }
  
  private subscribeCountry(): void {
    this.selectedCountrySubs =
      this.dashboardDataSVC.selectedCountry$.subscribe(res => {
        if (!res?.length) {
          return;
        }
  
        this.updateCountry(this.cloneCountryGroups(res));
      });
  }

  private subscribeSidepanelFilterCount(): void {
    this.sidepanelFilterCountSubs =
      this.dashboardDataSVC.sidepanelFilterCount$.subscribe(res => {
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
    // json parse & stringify used to create a deep copy of array of objects and end it to service
    this.dashboardDataSVC.setSelectedApprovalType(JSON.parse(JSON.stringify(this.approvalTypeCheckbox)));
    this.dashboardDataSVC.setSelectedCountry(JSON.parse(JSON.stringify(this.countryRegionCheckbox)));
    this.dashboardDataSVC.setSelectedOrderValue(JSON.parse(JSON.stringify(this.orderValueData)));
    this.dashboardDataSVC.setSidepanelFilterCount(JSON.parse(JSON.stringify(this.filterCount)));
    // prepare the order request data
    const isCountrySelected = this.filterCount[PPCFilterTypeEnum.Country] > 0 ? 1 : 0;
    const isApprovalTypeSelected = this.filterCount[PPCFilterTypeEnum.ApprovalType] > 0 ? 1 : 0;
    const isOrderValueSelected = this.filterCount[PPCFilterTypeEnum.OrderValue] > 0 ? 1 : 0;
    const selectedCountryKeys = this.countryRegionCheckbox
      .flatMap(group =>
        group.checkboxes
          .filter(checkbox => checkbox.checked)
          .map(checkbox => typeof checkbox.key === 'string' ? parseInt(checkbox.key) : checkbox.key)
      );
    const approvaselectedApprovalTypeKeys = this.approvalTypeCheckbox
      .filter(el => el.checked)
      .map(el => typeof el.key === 'string' ? parseInt(el.key) : el.key);
    
    const dataToSend: Partial<OrderRequest> = {
      ApprovalTypeFilter: isApprovalTypeSelected,      
      ApprovalType: approvaselectedApprovalTypeKeys,
      CountryFilter: isCountrySelected,
      Country: selectedCountryKeys,
      AmountFilter: isOrderValueSelected,
      AmountMax: this.orderValueData.max,
      AmountMin: this.orderValueData.min,
      PageIndex: 0,
      PageSize: PPC_DASHBOARD_PAGE_SIZE,
    };
    this.getOrderDetails(dataToSend);
  }

  ngOnDestroy(): void {    
    if(this.countryRegionDataSubs) this.countryRegionDataSubs.unsubscribe();
    if(this.selectedOrderValueSubs) this.selectedOrderValueSubs.unsubscribe();
    if(this.selectedApprovalTypeSubs) this.selectedApprovalTypeSubs.unsubscribe();
    if(this.selectedCountrySubs) this.selectedCountrySubs.unsubscribe();
    if(this.sidepanelFilterCountSubs) this.sidepanelFilterCountSubs.unsubscribe();
  }
}
