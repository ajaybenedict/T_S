import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { customCalendarHeaderButtons } from 'src/app/config/date-filter-buttons.config';
import { DateRangeService } from 'src/app/services/date-range.service';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';
import { FILTER_PANEL_BUTTON_CONFIG, RESET_BUTTON_CONFIG, TAB_BUTTON_CONFIGS } from 'src/app/config/filter-panel-buttons.config';
import { FilterDataAPIService } from 'src/app/services/filterdata-api.service';
import { Country, Vendor } from 'src/app/interface/filter-api.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements AfterViewInit {

  @ViewChild('datefilter', { read: ViewContainerRef }) datefilterVc!: ViewContainerRef;

  isFilterOpen!: boolean;

  filterPanelButtonConfig = FILTER_PANEL_BUTTON_CONFIG;
  resetButtonConfig = RESET_BUTTON_CONFIG;
  tabButtonConfig = TAB_BUTTON_CONFIGS;


  // Final applied filters (used outside the panel)
  appliedCheckboxLists: { [key: string]: any[] } = {
    Country: [],
    Vendor: [],
    Issues: []
  };

  // Temporary filters inside panel before Apply
  workingCheckboxLists: { [key: string]: any[] } = {
    Country: [],
    Vendor: [],
    Issues: []
  };

  checkboxList: any[] = [];

  tabCounts: { [key: string]: number } = {
    Country: 0,
    Vendor: 0,
    Issues: 0
  };

  appliedTabCounts: { [key: string]: number } = {
    Country: 0,
    Vendor: 0,
    Issues: 0
  };

  activeTab: string = '';
  headername: string = 'Filters';
  searchText: string = '';
  filteredCheckboxList: any[] = [];
  searchPlaceholder: string = 'Search';

  tabs: string[] = ['Vendor', 'Country', 'Issues'];




  constructor(
    private readonly injector: Injector,
    private readonly dateRangeService: DateRangeService,
    private readonly filterDataAPIService: FilterDataAPIService
  ) { }


  async ngAfterViewInit(): Promise<void> {
    await this.initializeHeaderService();
    await this.loadDateRangePicker();
    this.filterButtonChange('Country');
  }

  // Helper function to show/hide the filter pills
  hasActiveFilters(): boolean {
    return Object.values(this.appliedTabCounts).some(count => count > 0);
  }


  private async initializeHeaderService() {
    const serviceModule = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './S1HeaderConfigService',
    });

    const S1HeaderConfigService = serviceModule.S1HeaderConfigService;
    const headerServiceInstance = this.injector.get(S1HeaderConfigService);
    headerServiceInstance.setButtons(customCalendarHeaderButtons);
  }

  private async loadDateRangePicker() {
    const dateModule = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './ppcdaterange',
    });



    const compRef = this.datefilterVc.createComponent<typeof dateModule.S1DateRangePickerComponent>(
      dateModule.S1DateRangePickerComponent
    );

    const instance = compRef.instance as InstanceType<typeof dateModule.S1DateRangePickerComponent>;


    setTimeout(() => {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 1);

      if (instance.range?.patchValue) {
        instance.range.patchValue({
          start,
          end: today
        });
      }
    }, 0);

    const eventinstance = compRef.instance as {
      dateRangeChanged: EventEmitter<{ start: string; end: string }>;
    };


    eventinstance.dateRangeChanged.subscribe((range) => {
      this.dateRangeService.setDateRange(range);
    });

    compRef.changeDetectorRef.detectChanges();
  }

  redirecttoTabs(tabKey: string) {
    this.tabButtonConfig[tabKey][0].selected = false;

    // Deselect all buttons
    this.filterPanelButtonConfig.forEach(btn => btn.selected = false);

    // Select the tab that matches the clicked pill
    const selectedBtn = this.filterPanelButtonConfig.find(btn => btn.displayName === tabKey);
    if (selectedBtn) {
      selectedBtn.selected = true;
    }

    this.isFilterOpen = true;
    this.filterButtonChange(tabKey);
  }

  filterButtonChange(tabKey: string) {
    this.activeTab = tabKey;

    // If first time loading, load and copy data
    if (this.workingCheckboxLists[tabKey].length === 0) {
      const originalList = this.loadCheckboxList(tabKey);

      // Save to both applied and working
      this.appliedCheckboxLists[tabKey] = JSON.parse(JSON.stringify(originalList));
      this.workingCheckboxLists[tabKey] = JSON.parse(JSON.stringify(originalList));
    }

    // Use working list in the panel
    this.checkboxList = this.workingCheckboxLists[tabKey];
    this.searchText = '';
    this.filteredCheckboxList = [...this.checkboxList];
    this.searchPlaceholder = `Search for ${tabKey}`;
  }




  onSearchChange() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.filteredCheckboxList = [...this.checkboxList];
    } else {
      this.filteredCheckboxList = this.checkboxList.filter(cb =>
        cb.displayName.toLowerCase().includes(search)
      );
    }
  }

  onResetAllTabs() {

    Object.keys(this.workingCheckboxLists).forEach(tab => {
      this.workingCheckboxLists[tab] = this.workingCheckboxLists[tab].map(cb => ({
        ...cb,
        checked: false
      }));

    });


    this.tabCounts = {
      Country: 0,
      Vendor: 0,
      Issues: 0
    };
    this.appliedTabCounts = this.tabCounts;


    this.checkboxList = [...this.workingCheckboxLists[this.activeTab]];
    this.filteredCheckboxList = [...this.checkboxList];
    this.searchText = '';
  }


  loadCheckboxList(tabKey: string): any[] {
    if (this.workingCheckboxLists[tabKey].length > 0) {
      return this.workingCheckboxLists[tabKey];
    }

    if (tabKey === 'Country') {
      this.filterDataAPIService.getCountryNames()
        .subscribe((response: Country[]) => {
          const transformed = response.map(item => ({
            displayName: item.name,
            key: item.code,
            checked: false,
          }));

          this.workingCheckboxLists[tabKey] = transformed;
          this.appliedCheckboxLists[tabKey] = JSON.parse(JSON.stringify(transformed));

          if (this.activeTab === tabKey) {
            this.checkboxList = [...transformed];
            this.filteredCheckboxList = [...transformed];
          }
        });
    } else if (tabKey === 'Vendor') {
      this.filterDataAPIService.getVendorNames()
        .subscribe((response: Vendor[]) => {
          const transformed = response.map(item => ({
            displayName: item.vendorName,
            key: item.vendorKey,
            checked: false,
          }));

          this.workingCheckboxLists[tabKey] = transformed;
          this.appliedCheckboxLists[tabKey] = JSON.parse(JSON.stringify(transformed));

          if (this.activeTab === tabKey) {
            this.checkboxList = [...transformed];
            this.filteredCheckboxList = [...transformed];
          }
        });
    }
    else if (tabKey === 'Issues') {
      return [
        { displayName: 'None', key: 1, checked: false },
        { displayName: 'Issues Only', key: 2, checked: false },
        { displayName: 'CleanOrders', key: 3, checked: false },

      ];
    } else {
      return [];
    }
    return []; // Return empty until async data is available
  }

  get selectedCheckboxCount(): number {
    return this.checkboxList.filter(cb => cb.checked).length;
  }

  onCheckboxChange(updatedList: any[]) {
    // Only update the checked state of each item in the working list
    updatedList.forEach(updatedItem => {
      const workingItem = this.workingCheckboxLists[this.activeTab].find(item => item.key === updatedItem.key);
      if (workingItem) {
        workingItem.checked = updatedItem.checked;
      }

      const originalItem = this.checkboxList.find(item => item.key === updatedItem.key);
      if (originalItem) {
        originalItem.checked = updatedItem.checked;
      }
    });

    // Recalculate selected count
    const selectedCount = this.workingCheckboxLists[this.activeTab].filter(cb => cb.checked).length;

    // Update tab count
    this.tabCounts = {
      ...this.tabCounts,
      [this.activeTab]: selectedCount
    };

    // Reapply the search to reflect changes
    this.onSearchChange();
  }



  onApplyFilters() {
    Object.keys(this.workingCheckboxLists).forEach(tab => {
      // Copy filters to applied
      this.appliedCheckboxLists[tab] = JSON.parse(JSON.stringify(this.workingCheckboxLists[tab]));


      this.appliedTabCounts[tab] = this.tabCounts[tab];

      if (this.tabButtonConfig[tab]?.length > 0) {
        this.tabButtonConfig[tab][0].selectedCount = this.tabCounts[tab];
        this.tabButtonConfig[tab][0].hasCloseBtn = true;

      }
    });

    this.isFilterOpen = false;
  }



  onClearTab(tabKey: string) {
    // reset all checkboxes for that tab
    this.workingCheckboxLists[tabKey] = this.workingCheckboxLists[tabKey].map(cb => ({
      ...cb,
      checked: false
    }));

    // force refresh if currently active
    if (this.activeTab === tabKey) {
      this.checkboxList = [...this.workingCheckboxLists[tabKey]];
      this.filteredCheckboxList = [...this.checkboxList];
      this.searchText = ''; // optional: reset search input
    }

    // update count
    this.tabCounts = {
      ...this.tabCounts,
      [tabKey]: 0
    };

    this.appliedTabCounts = {
      ...this.appliedTabCounts,
      [tabKey]: 0
    };
  }

}
