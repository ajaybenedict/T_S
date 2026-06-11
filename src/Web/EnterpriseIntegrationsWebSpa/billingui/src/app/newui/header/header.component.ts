import {
  AfterViewInit,
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Injector,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { customCalendarHeaderButtons } from 'src/app/config/date-filter-buttons.config';
import { DateRangeService } from 'src/app/services/date-range.service';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';
import {
  FILTER_PANEL_BUTTON_CONFIG,
  RESET_BUTTON_CONFIG,
  TAB_BUTTON_CONFIGS
} from 'src/app/config/filter-panel-buttons.config';
import { FilterDataAPIService } from 'src/app/services/filterdata-api.service';
import { Country, Vendor } from 'src/app/interface/cbc-dashboard-api.interface';
import { CheckBox, CheckboxGroup, TabButton } from 'src/app/interface/button.interface';
import { TabCounts, CheckboxLists, DateRange } from 'src/app/interface/component-data.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements AfterViewInit {

  @ViewChild('datefilter', { read: ViewContainerRef }) datefilterVc!: ViewContainerRef;

  isFilterOpen = false;

  filterPanelButtonConfig: TabButton[] = FILTER_PANEL_BUTTON_CONFIG;
  resetButtonConfig: TabButton[] = RESET_BUTTON_CONFIG;
  tabButtonConfig: Record<string, TabButton[]> = TAB_BUTTON_CONFIGS;

  appliedCheckboxLists: CheckboxLists = {
    Country: [],
    Vendor: [],
    Issues: []
  };

  workingCheckboxLists: CheckboxLists = {
    Country: [],
    Vendor: [],
    Issues: []
  };

  checkboxList: (CheckBox | CheckboxGroup)[] = [];
  filteredCheckboxList: (CheckBox | CheckboxGroup)[] = [];
  originalCheckboxList: (CheckBox | CheckboxGroup)[] = []; // Keep original for search restoration

  tabCounts: TabCounts = {
    Country: 0,
    Vendor: 0,
    Issues: 0
  };

  appliedTabCounts: TabCounts = {
    Country: 0,
    Vendor: 0,
    Issues: 0
  };

  activeTab = '';
  headername = 'Filters';
  searchText = '';
  searchPlaceholder = 'Search';

  tabs: string[] = ['Vendor', 'Country', 'Issues'];

  selectedValues: CheckboxLists = {
    Country: [],
    Vendor: [],
    Issues: []
  };

  constructor(
    private readonly injector: Injector,
    private readonly dateRangeService: DateRangeService,
    private readonly filterDataAPIService: FilterDataAPIService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  async ngAfterViewInit(): Promise<void> {
    await this.initializeHeaderService();
    await this.loadDateRangePicker();
    await this.preLoadCountryData();
    this.filterButtonChange('Country');
  }

  // ------------------ UTILITIES ------------------

  private clone(data: CheckboxLists | (CheckBox | CheckboxGroup)[] | TabCounts): any {
    return structuredClone(data);
  }

  private updateCheckboxState(list: (CheckBox | CheckboxGroup)[], checked: boolean): (CheckBox | CheckboxGroup)[] {
    return list.map((cb: CheckBox | CheckboxGroup) => {
      if ('checkboxes' in cb) {
        return { ...cb };
      }
      return { ...cb, checked };
    });
  }

  private normalizeGroupState(group: CheckboxGroup): CheckboxGroup {
    const checkboxes = group.checkboxes?.map(cb => ({ ...cb })) || [];
    const allChecked = checkboxes.length > 0 && checkboxes.every(cb => cb.checked);
    const someChecked = checkboxes.some(cb => cb.checked);

    return {
      ...group,
      checkboxes,
      checked: allChecked,
      indeterminate: someChecked && !allChecked,
    } as CheckboxGroup;
  }

  resetCountryGroups(): void {
    const countryList = (this.workingCheckboxLists['Country'] as CheckboxGroup[]).map(group =>
      this.normalizeGroupState({
        ...group,
        checkboxes: group.checkboxes?.map(cb => ({ ...cb, checked: false })) || []
      })
    );

    // Create new array reference to ensure change detection
    this.workingCheckboxLists['Country'] = [...countryList];
    this.appliedCheckboxLists['Country'] = this.clone(countryList);

    // Reset tab counts
    this.tabCounts['Country'] = 0;
    this.appliedTabCounts['Country'] = 0;

    // Trigger change detection
    this.cdr.detectChanges();
  }

  private getSelectedCount(list: (CheckBox | CheckboxGroup)[]): number {
    return list.filter((cb: CheckBox | CheckboxGroup) => {
      if ('checkboxes' in cb) {
        return false;
      }
      return cb.checked;
    }).length;
  }

  private setActiveList(tabKey: string, list: (CheckBox | CheckboxGroup)[]): void {
    if (this.activeTab === tabKey) {
      this.checkboxList = this.clone(list) as (CheckBox | CheckboxGroup)[];
      this.originalCheckboxList = this.clone(list) as (CheckBox | CheckboxGroup)[]; // Preserve original for search
      this.filteredCheckboxList = this.clone(list) as (CheckBox | CheckboxGroup)[];
    }
  }

  private async preLoadCountryData(): Promise<void> {
    return new Promise((resolve) => {
      const payload = ["ALL"];
      this.filterDataAPIService.getCountryNames(payload).subscribe((res: Country[]) => {
        const groupMap = new Map<string, any>();
        for (const item of res) {
          let group = groupMap.get(item.erpCode);
          if (!group) {
            group = {
              id: item.erpCode,
              groupTitle: item.erpCode,
              checkboxes: []
            };
            groupMap.set(item.erpCode, group);
          }
          group.checkboxes.push({
            displayName: item.name,
            key: item.code,
            checked: false
          });
        }
        const countryData = Array.from(groupMap.values());
        this.workingCheckboxLists['Country'] = countryData;
        this.appliedCheckboxLists['Country'] = this.clone(countryData);
        this.setActiveList('Country', countryData);
        resolve();
      });
    });
  }

  // ------------------ INIT ------------------

  private async initializeHeaderService(): Promise<void> {
    const serviceModule: any = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './S1HeaderConfigService',
    });

    const S1HeaderConfigService = serviceModule.S1HeaderConfigService;
    const headerServiceInstance = this.injector.get(S1HeaderConfigService);
    headerServiceInstance.setButtons(customCalendarHeaderButtons);
  }

  private async loadDateRangePicker(): Promise<void> {
    const dateModule: any = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './ppcdaterange',
    });

    const compRef = this.datefilterVc.createComponent(
      dateModule.S1DateRangePickerComponent
    );

    const instance = compRef.instance as any;

    setTimeout(() => {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 1);
      instance.range?.patchValue?.({ start, end: today });
    });

    (compRef.instance as {
      dateRangeChanged: EventEmitter<DateRange>;
    }).dateRangeChanged.subscribe((range: DateRange) => {
      this.dateRangeService.setDateRange(range);
    });

    compRef.changeDetectorRef.detectChanges();
  }

  // ------------------ FILTER LOGIC ------------------

  filterButtonChange(tabKey: string): void {
    this.activeTab = tabKey;

    if (!this.workingCheckboxLists[tabKey].length) {
      const list = this.loadCheckboxList(tabKey);
      this.workingCheckboxLists[tabKey] = this.clone(list) as (CheckBox | CheckboxGroup)[];
      this.appliedCheckboxLists[tabKey] = this.clone(list) as (CheckBox | CheckboxGroup)[];
    }

    this.checkboxList = this.clone(this.workingCheckboxLists[tabKey]) as (CheckBox | CheckboxGroup)[];
    this.originalCheckboxList = this.clone(this.workingCheckboxLists[tabKey]) as (CheckBox | CheckboxGroup)[]; // Preserve original
    this.filteredCheckboxList = this.clone(this.checkboxList) as (CheckBox | CheckboxGroup)[];
    this.searchText = '';
    this.searchPlaceholder = `Search for ${tabKey}`;
  }

  redirecttoTabs(tabKey: string): void {
    this.filterPanelButtonConfig.forEach((btn: TabButton) => btn.selected = false);

    const selectedBtn = this.filterPanelButtonConfig.find(
      (btn: TabButton) => btn.displayName === tabKey
    );
    if (selectedBtn) selectedBtn.selected = true;

    this.isFilterOpen = true;
    this.filterButtonChange(tabKey);
  }

  loadCheckboxList(tabKey: string): any[] {
    if (this.workingCheckboxLists[tabKey].length) {
      return this.workingCheckboxLists[tabKey];
    }

    const handleResponse = (data: any[]) => {
      this.workingCheckboxLists[tabKey] = data;
      this.appliedCheckboxLists[tabKey] = this.clone(data);
      this.setActiveList(tabKey, data);
    };

    if (tabKey === 'Country') {
      // Data is pre-loaded via preLoadCountryData(), return the pre-loaded data
      return this.workingCheckboxLists['Country'];
    } else if (tabKey === 'Vendor') {
      this.filterDataAPIService.getVendorNames().subscribe((res: Vendor[]) => {
        handleResponse(res.map(item => ({
          displayName: item.vendorName,
          key: item.vendorKey,
          checked: false
        })));
      });
    } else if (tabKey === 'Issues') {
      return [
        { displayName: 'None', key: 1, checked: false },
        { displayName: 'Issues Only', key: 2, checked: false },
        { displayName: 'CleanOrders', key: 3, checked: false }
      ];
    }

    return [];
  }

  // ------------------ SEARCH ------------------

  onSearchChange(): void {
    const search = this.searchText.toLowerCase().trim();

    if (this.activeTab === 'Country') {
      if (search) {
        this.filteredCheckboxList = (this.originalCheckboxList as CheckboxGroup[])
          .map((group: CheckboxGroup) => {
            // Check if group title matches
            const groupMatches = group.groupTitle?.toLowerCase().includes(search);

            // Filter checkboxes that match search
            const filteredCheckboxes = group.checkboxes?.filter((cb: CheckBox) =>
              cb.displayName.toLowerCase().includes(search)
            ) || [];

            // Include group if title matches OR if any checkbox matches
            if (groupMatches || filteredCheckboxes.length > 0) {
              return {
                ...group,
                checkboxes: groupMatches ? group.checkboxes : filteredCheckboxes
              };
            }
            return null;
          })
          .filter((group: CheckboxGroup | null) => group !== null) as CheckboxGroup[];
      } else {
        // Restore full list with all checkboxes when search is cleared
        this.filteredCheckboxList = this.clone(this.originalCheckboxList) as (CheckBox | CheckboxGroup)[];
      }
    } else {
      // Search in flat data
      this.filteredCheckboxList = search
        ? (this.originalCheckboxList as CheckBox[]).filter((cb: CheckBox) =>
          cb.displayName.toLowerCase().includes(search)
        )
        : [...(this.checkboxList as CheckBox[])];
    }
  }

  // ------------------ CHECKBOX ------------------

  onCheckboxChange(updatedList: (CheckBox | CheckboxGroup)[]): void {
    try {
      if (this.activeTab === 'Country') {

        const groups = this.workingCheckboxLists['Country'] as CheckboxGroup[];

        const updatedGroups = groups.map(group => {
          const updated = (updatedList as CheckboxGroup[]).find(g => g.id === group.id);

          return updated
            ? {
              ...group,
              checkboxes: updated.checkboxes.map(cb => ({ ...cb }))
            }
            : group;
        });

        this.workingCheckboxLists['Country'] = updatedGroups;

        this.originalCheckboxList = (this.originalCheckboxList as CheckboxGroup[]).map(group => {
          const updated = (updatedList as CheckboxGroup[]).find(g => g.id === group.id);

          return updated
            ? this.normalizeGroupState({
              ...group,
              checkboxes: updated.checkboxes.map(cb => ({ ...cb }))
            })
            : group;
        });

        const selectedCount = updatedGroups.reduce((sum: number, group: CheckboxGroup) => {
          return sum + (group.checkboxes?.filter(cb => cb.checked).length || 0);
        }, 0);

        this.tabCounts[this.activeTab as keyof TabCounts] = selectedCount;

      } else {

        const workingList = this.workingCheckboxLists[this.activeTab] as CheckBox[];

        const updatedWorkingList = workingList.map(item => {
          const updated = (updatedList as CheckBox[]).find(u => u.key === item.key);

          return updated
            ? { ...item, checked: updated.checked }
            : item;
        });

        this.workingCheckboxLists[this.activeTab] = updatedWorkingList;
        this.checkboxList = this.clone(updatedWorkingList) as (CheckBox | CheckboxGroup)[];

        this.originalCheckboxList = (this.originalCheckboxList as CheckBox[]).map(item => {
          const updated = (updatedList as CheckBox[]).find(u => u.key === item.key);

          return updated
            ? { ...item, checked: updated.checked }
            : item;
        });

        this.tabCounts[this.activeTab as keyof TabCounts] =
          this.getSelectedCount(updatedWorkingList);
      }

      this.onSearchChange();

      // safer than detectChanges alone in dynamic UI cases
      this.cdr.markForCheck();
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error in onCheckboxChange:', error);
    }
  }

  get selectedCheckboxCount(): number {
    return this.getSelectedCount(this.checkboxList);
  }

  // ------------------ APPLY / RESET ------------------

  onApplyFilters(): void {
    Object.keys(this.workingCheckboxLists).forEach((tab: string) => {
      this.appliedCheckboxLists[tab] = this.clone(this.workingCheckboxLists[tab]) as (CheckBox | CheckboxGroup)[];
      this.appliedTabCounts[tab as keyof TabCounts] = this.tabCounts[tab as keyof TabCounts];

      const config = this.tabButtonConfig[tab]?.[0];
      if (config) {
        config.selectedCount = this.tabCounts[tab as keyof TabCounts];
        config.hasCloseBtn = true;
      }
    });
    
    this.logSelectedValues('Applied Filters');
    this.isFilterOpen = false;
  }

  onResetAllTabs(): void {
    Object.keys(this.workingCheckboxLists).forEach((tab: string) => {
      if (tab === 'Country') {
        const countryGroups = (this.workingCheckboxLists[tab] as CheckboxGroup[]).map(group =>
          this.normalizeGroupState({
            ...group,
            checkboxes: group.checkboxes?.map(cb => ({ ...cb, checked: false })) || []
          })
        );

        // Create new array reference for change detection
        this.workingCheckboxLists[tab] = [...countryGroups];
      } else {
        // Reset flat checkboxes
        this.workingCheckboxLists[tab] =
          this.updateCheckboxState(this.workingCheckboxLists[tab], false);
      }

      this.tabCounts[tab as keyof TabCounts] = 0;
      this.appliedTabCounts[tab as keyof TabCounts] = 0;
    });

    this.checkboxList = this.clone(this.workingCheckboxLists[this.activeTab]) as (CheckBox | CheckboxGroup)[];
    this.originalCheckboxList = this.clone(this.workingCheckboxLists[this.activeTab]) as (CheckBox | CheckboxGroup)[]; // Preserve original
    this.filteredCheckboxList = this.clone(this.checkboxList) as (CheckBox | CheckboxGroup)[];
    this.searchText = '';
    this.cdr.detectChanges();

    this.logSelectedValues('After reset all tabs');
  }

  onClearTab(tabKey: string): void {
    if (tabKey === 'Country') {
      // Clear checkboxes within groups and reset parent states
      const countryGroups = (this.workingCheckboxLists[tabKey] as CheckboxGroup[]).map(group =>
        this.normalizeGroupState({
          ...group,
          checkboxes: group.checkboxes?.map(cb => ({ ...cb, checked: false })) || []
        })
      );
      // Create new array reference to ensure change detection
      this.workingCheckboxLists[tabKey] = [...countryGroups];
    } else {
      // Clear flat checkboxes
      this.workingCheckboxLists[tabKey] =
        this.updateCheckboxState(this.workingCheckboxLists[tabKey], false);
    }

    this.tabCounts[tabKey as keyof TabCounts] = 0;
    this.appliedTabCounts[tabKey as keyof TabCounts] = 0;

    if (this.activeTab === tabKey) {
      this.checkboxList = this.clone(this.workingCheckboxLists[tabKey]) as (CheckBox | CheckboxGroup)[];
      this.originalCheckboxList = this.clone(this.workingCheckboxLists[tabKey]) as (CheckBox | CheckboxGroup)[]; // Preserve original
      this.filteredCheckboxList = this.clone(this.checkboxList) as (CheckBox | CheckboxGroup)[];
      this.searchText = '';
    }

    this.cdr.detectChanges();
    this.logSelectedValues(`After clear tab ${tabKey}`);
  }

  // ------------------ UI HELPERS ------------------

  hasActiveFilters(): boolean {
    return Object.values(this.appliedTabCounts).some(count => count > 0);
  }

  canApplyFilters(): boolean {
    return Object.values(this.tabCounts).some(count => count > 0);
  }

  canResetFilters(): boolean {
    return Object.values(this.tabCounts).some(count => count > 0);
  }

  private getSelectedValues(): CheckboxLists {
    const selectedValues: CheckboxLists = {};

    Object.keys(this.workingCheckboxLists).forEach((tab: string) => {
      const selected: any[] = [];

      if (tab === 'Country') {
        // Extract selected items from grouped data
        (this.workingCheckboxLists[tab] as CheckboxGroup[]).forEach((group: CheckboxGroup) => {
          group.checkboxes?.forEach((cb: CheckBox) => {
            if (cb.checked) {
              selected.push({
                groupTitle: group.groupTitle,
                ...cb
              });
            }
          });
        });
      } else {
        // Extract selected items from flat data
        (this.workingCheckboxLists[tab] as CheckBox[]).forEach((item: CheckBox) => {
          if (item.checked) {
            selected.push(item);
          }
        });
      }

      if (selected.length > 0) {
        selectedValues[tab] = selected;
      }
    });

    return selectedValues;
  }

  private logSelectedValues(action: string): void {
    const selectedValues = this.getSelectedValues();
    this.selectedValues = selectedValues;
  }

  trackByGroupId(index: number, group: any): any {
    return group.id;
  }
}