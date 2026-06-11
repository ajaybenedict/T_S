import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef, Injector, ViewContainerRef } from '@angular/core';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { FilterDataAPIService } from 'src/app/services/filterdata-api.service';
import { DateRangeService } from 'src/app/services/date-range.service';
import { CheckBox, CheckboxGroup } from 'src/app/interface/button.interface';
import { Country, Vendor } from 'src/app/interface/filter-api.interface';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

// Mock services
class MockFilterDataAPIService {
  getCountryNames = jasmine.createSpy('getCountryNames').and.returnValue(of([]));
  getVendorNames = jasmine.createSpy('getVendorNames').and.returnValue(of([]));
}

class MockDateRangeService {
  setDateRange = jasmine.createSpy('setDateRange');
}

class MockInjector {
  get = jasmine.createSpy('get').and.returnValue({});
}

class MockViewContainerRef {
  createComponent = jasmine.createSpy('createComponent').and.returnValue({
    instance: {},
    changeDetectorRef: { detectChanges: jasmine.createSpy('detectChanges') }
  });
}

class MockChangeDetectorRef {
  markForCheck = jasmine.createSpy('markForCheck');
  detectChanges = jasmine.createSpy('detectChanges');
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockFilterService: MockFilterDataAPIService;
  let mockDateService: MockDateRangeService;
  let mockInjector: MockInjector;
  let mockCdr: MockChangeDetectorRef;

  beforeEach(async () => {
    mockFilterService = new MockFilterDataAPIService();
    mockDateService = new MockDateRangeService();
    mockInjector = new MockInjector();
    mockCdr = new MockChangeDetectorRef();

    await configureTestBed({
      declarations: [HeaderComponent],
      providers: [
        { provide: FilterDataAPIService, useValue: mockFilterService },
        { provide: DateRangeService, useValue: mockDateService },
        { provide: Injector, useValue: mockInjector },
        { provide: ChangeDetectorRef, useValue: mockCdr },
        { provide: ViewContainerRef, useValue: new MockViewContainerRef() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should initialize header service and load date range picker', fakeAsync(() => {
      spyOn<any>(component, 'initializeHeaderService');
      spyOn<any>(component, 'loadDateRangePicker');
      spyOn<any>(component, 'preLoadCountryData');
      spyOn(component, 'filterButtonChange');

      component.ngAfterViewInit();
      tick();

      expect(component['initializeHeaderService']).toHaveBeenCalled();
      expect(component['loadDateRangePicker']).toHaveBeenCalled();
      expect(component['preLoadCountryData']).toHaveBeenCalled();
      expect(component.filterButtonChange).toHaveBeenCalledWith('Country');
    }));
  });

  describe('filterButtonChange', () => {
    it('should set active tab and load checkbox list', () => {
      spyOn(component, 'loadCheckboxList').and.returnValue([]);

      component.filterButtonChange('Vendor');

      expect(component.activeTab).toBe('Vendor');
      expect(component.loadCheckboxList).toHaveBeenCalledWith('Vendor');
      expect(component.checkboxList).toEqual([]);
      expect(component.originalCheckboxList).toEqual([]);
      expect(component.filteredCheckboxList).toEqual([]);
      expect(component.searchText).toBe('');
      expect(component.searchPlaceholder).toBe('Search for Vendor');
    });
  });

  describe('onCheckboxChange', () => {
    it('should update working lists and counts for Country tab', () => {
      component.activeTab = 'Country';
      component.workingCheckboxLists['Country'] = [
        { id: 'US', groupTitle: 'US', checkboxes: [{ key: 1, displayName: 'Item1', checked: false }] }
      ] as CheckboxGroup[];
      component.originalCheckboxList = component.workingCheckboxLists['Country'];

      const updatedList: CheckboxGroup[] = [
        { id: 'US', groupTitle: 'US', checkboxes: [{ key: 1, displayName: 'Item1', checked: true }] }
      ];

      component.onCheckboxChange(updatedList);

      expect((component.workingCheckboxLists['Country'] as CheckboxGroup[])[0].checkboxes[0].checked).toBe(true);
      expect(component.tabCounts['Country']).toBe(1);
    });

    it('should update working lists and counts for non-Country tab', () => {
      component.activeTab = 'Vendor';
      component.workingCheckboxLists['Vendor'] = [
        { key: 1, displayName: 'Vendor1', checked: false }
      ] as CheckBox[];
      component.originalCheckboxList = component.workingCheckboxLists['Vendor'];

      const updatedList: CheckBox[] = [
        { key: 1, displayName: 'Vendor1', checked: true }
      ];

      component.onCheckboxChange(updatedList);

      expect((component.workingCheckboxLists['Vendor'] as CheckBox[])[0].checked).toBe(true);
      expect((component.checkboxList[0] as CheckBox).checked).toBe(true);
      expect(component.tabCounts['Vendor']).toBe(1);
    });
  });

  describe('onSearchChange', () => {
    it('should filter checkbox list for Country tab', () => {
      component.activeTab = 'Country';
      component.originalCheckboxList = [
        { id: 'US', groupTitle: 'US', checkboxes: [{ key: 1, displayName: 'Item1', checked: false }] },
        { id: 'CA', groupTitle: 'CA', checkboxes: [{ key: 2, displayName: 'Item2', checked: false }] }
      ] as CheckboxGroup[];
      component.checkboxList = component.originalCheckboxList;

      component.searchText = 'US';
      component.onSearchChange();

      expect(component.filteredCheckboxList.length).toBe(1);
      expect((component.filteredCheckboxList[0] as CheckboxGroup).id).toBe('US');
    });

    it('should filter checkbox list for non-Country tab', () => {
      component.activeTab = 'Vendor';
      component.originalCheckboxList = [
        { key: 1, displayName: 'Vendor1', checked: false },
        { key: 2, displayName: 'Vendor2', checked: false }
      ] as CheckBox[];
      component.checkboxList = component.originalCheckboxList;

      component.searchText = 'Vendor1';
      component.onSearchChange();

      expect(component.filteredCheckboxList.length).toBe(1);
      expect((component.filteredCheckboxList[0] as CheckBox).displayName).toBe('Vendor1');
    });
  });

  describe('onResetAllTabs', () => {
    it('should reset all working lists and counts', () => {
      component.workingCheckboxLists = {
        Country: [{ id: 'US', groupTitle: 'US', checkboxes: [{ key: 1, displayName: 'Item1', checked: true }] }] as CheckboxGroup[],
        Vendor: [{ key: 1, displayName: 'Vendor1', checked: true }] as CheckBox[],
        Issues: [{ key: 1, displayName: 'Issue1', checked: true }] as CheckBox[]
      };
      component.activeTab = 'Vendor';

      component.onResetAllTabs();

      expect((component.workingCheckboxLists['Country'] as CheckboxGroup[])[0].checkboxes[0].checked).toBe(false);
      expect((component.workingCheckboxLists['Vendor'] as CheckBox[])[0].checked).toBe(false);
      expect(component.tabCounts['Country']).toBe(0);
      expect(component.tabCounts['Vendor']).toBe(0);
      expect((component.checkboxList[0] as CheckBox).checked).toBe(false);
    });
  });

  describe('onClearTab', () => {
    it('should clear specific tab', () => {
      component.workingCheckboxLists['Vendor'] = [{ key: 1, displayName: 'Vendor1', checked: true }] as CheckBox[];
      component.activeTab = 'Vendor';

      component.onClearTab('Vendor');

      expect((component.workingCheckboxLists['Vendor'] as CheckBox[])[0].checked).toBe(false);
      expect((component.checkboxList[0] as CheckBox).checked).toBe(false);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true if there are applied filters', () => {
      component.appliedTabCounts = { Country: 1, Vendor: 0, Issues: 0 };
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should return false if no applied filters', () => {
      component.appliedTabCounts = { Country: 0, Vendor: 0, Issues: 0 };
      expect(component.hasActiveFilters()).toBe(false);
    });
  });

  describe('canApplyFilters', () => {
    it('should return true if there are selected items', () => {
      component.tabCounts = { Country: 1, Vendor: 0, Issues: 0 };
      expect(component.canApplyFilters()).toBe(true);
    });

    it('should return false if no selected items', () => {
      component.tabCounts = { Country: 0, Vendor: 0, Issues: 0 };
      expect(component.canApplyFilters()).toBe(false);
    });
  });

  describe('canResetFilters', () => {
    it('should return true if there are selected items', () => {
      component.tabCounts = { Country: 1, Vendor: 0, Issues: 0 };
      expect(component.canResetFilters()).toBe(true);
    });

    it('should return false if no selected items', () => {
      component.tabCounts = { Country: 0, Vendor: 0, Issues: 0 };
      expect(component.canResetFilters()).toBe(false);
    });
  });

  describe('onApplyFilters', () => {
    it('should apply working lists to applied lists', () => {
      component.workingCheckboxLists = {
        Country: [{ id: 'US', groupTitle: 'US', checkboxes: [{ key: 1, displayName: 'Item1', checked: true }] }] as CheckboxGroup[],
        Vendor: [{ key: 1, displayName: 'Vendor1', checked: true }] as CheckBox[],
        Issues: []
      };
      component.tabCounts = { Country: 1, Vendor: 1, Issues: 0 };

      component.onApplyFilters();

      expect(component.appliedCheckboxLists['Country']).toEqual(component.workingCheckboxLists['Country']);
      expect(component.appliedTabCounts['Country']).toBe(1);
      expect(component.isFilterOpen).toBe(false);
    });
  });

  describe('getSelectedValues', () => {
    it('should return selected values for all tabs', () => {
      component.workingCheckboxLists = {
        Country: [{ id: 'US', groupTitle: 'US', checkboxes: [{ key: 1, displayName: 'Item1', checked: true }] }] as CheckboxGroup[],
        Vendor: [{ key: 1, displayName: 'Vendor1', checked: true }] as CheckBox[],
        Issues: []
      };

      const result = component['getSelectedValues']();

      expect(result['Country']).toEqual([{ groupTitle: 'US', ...(component.workingCheckboxLists['Country'] as CheckboxGroup[])[0].checkboxes[0] }]);
      expect(result['Vendor']).toEqual([component.workingCheckboxLists['Vendor'][0]]);
    });
  });

  describe('normalizeGroupState', () => {
    it('should normalize group state correctly', () => {
      const group: CheckboxGroup = {
        id: 'US',
        groupTitle: 'US',
        checkboxes: [
          { key: 1, displayName: 'Item1', checked: true },
          { key: 2, displayName: 'Item2', checked: false }
        ]
      };

      const result = component['normalizeGroupState'](group) as any;

      expect(result.checked).toBe(false);
      expect(result.indeterminate).toBe(true);
      expect(result.checkboxes[0].checked).toBe(true);
      expect(result.checkboxes[1].checked).toBe(false);
    });
  });

  describe('getSelectedCount', () => {
    it('should return count of selected checkboxes', () => {
      const list: CheckBox[] = [
        { key: 1, displayName: 'Item1', checked: true },
        { key: 2, displayName: 'Item2', checked: false }
      ];

      const result = component['getSelectedCount'](list);

      expect(result).toBe(1);
    });
  });

  describe('clone', () => {
    it('should deep clone the object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = component['clone'](obj as any);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });
  });

  describe('updateCheckboxState', () => {
    it('should update checkbox state', () => {
      const list: CheckBox[] = [
        { key: 1, displayName: 'Item1', checked: true },
        { key: 2, displayName: 'Item2', checked: false }
      ];

      const result = component['updateCheckboxState'](list, false);

      expect((result[0] as CheckBox).checked).toBe(false);
      expect((result[1] as CheckBox).checked).toBe(false);
    });
  });
});
