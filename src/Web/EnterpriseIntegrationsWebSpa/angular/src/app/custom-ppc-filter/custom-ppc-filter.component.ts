import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DATE_OPTION_CUSTOM, DATE_OPTION_NINETYDAYS, DATE_OPTION_SEVENDAYS, DATE_OPTION_SIXTYDAYS, DATE_OPTION_THIRTYDAYS, DATE_OPTION_TODAY, TAB_VALUE_APPROVED, TAB_VALUE_DECLINED, TAB_VALUE_NEEDSAPPROVAL } from '../core/constants/constants';
import { UserApiService } from '../core/services/user-api.service';
import { DataState } from '../core/services/data-state';

@Component({
  selector: 'app-custom-ppc-filter',
  templateUrl: './custom-ppc-filter.component.html',
  styleUrls: ['./custom-ppc-filter.component.css']
})
export class CustomPpcFilterComponent implements OnInit {
  @Output() searchTextValue = new EventEmitter<any>();

  dropdownOpen: boolean = false;
  datepickData = [
    { id: '1', value: 'Yesterday' },
    { id: '2', value: 'Last 7 Days' },
    { id: '3', value: 'Last 30 Days' },
    { id: '4', value: 'Last 60 Days' },
    { id: '5', value: 'Last 90 Days' }
  ];
  countries: any;
  resultcountries: any;
  selectedCountries: any;
  selectedDate: any;
  selectedLink: string = 'Needs Approval';
  currentLink = '1,2,3,5,7';
  isFilterVisible = true;
  filterForm: FormGroup;
  filetrDateObj: any;
  fromDateFilter: any;
  toDateFilter: any;
  orderLinkSelect: any;
  countryCount: number = 0;
  showCountryCount = false;
  datepickCount: any;
  showdate = false;

  constructor(private fb: FormBuilder, private userApiService: UserApiService, private dataState: DataState) {
    this.selectedCountries = [];
    this.filterForm = fb.group({
      search: [''], // Add default values if needed
      Countrysearch: [''],
      datePick: [''],
      country: fb.array([])
    });
    this.getCountries();
    this.handleValueChanges();
    this.searchCountryText();
    this.selectDate('');
  }

  ngOnInit(){
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(async (searchValue) => this.searchText(searchValue))
      )
      .subscribe();
  }

  initializeCheckboxes() {
    this.countries.forEach(() => {
      const control = this.fb.control(false); // Initialize with 'false' (not checked)
      (this.filterForm.get('country') as FormArray).push(control);
    });
  }

  onCheckboxChange(index: number, country: any) {
    const checkboxes = this.filterForm.get('country') as FormArray;
    const isChecked = checkboxes.at(index).value;

    if (isChecked) {
      this.countryCount = this.countryCount + 1;

      this.selectedCountries.push(country.id);
    } else {
      const index = this.selectedCountries.indexOf(country.id);
      if (index !== -1) {
        this.selectedCountries.splice(index, 1);
      }
      this.countryCount = this.countryCount - 1;
    }
    //emit
    this.searchText();

    if (this.countryCount == 0) {
      this.showCountryCount = false;
    }
    else {
      this.showCountryCount = true;
    }
  }

  searchCountryText() {
    this.filterForm.get('Countrysearch')?.valueChanges.subscribe((value: any) => {
      const lowercasedValue = value?.toLowerCase();
      const filteredCountries = this.resultcountries.filter(
        (country: { name: string }) => country?.name?.toLowerCase().includes(lowercasedValue)
      )
      this.countries = filteredCountries;
    });
  }

  handleValueChanges() {
    if (this.countries?.length > 0) {
      this.filterForm.controls['country'].valueChanges.subscribe((val: any) => {
      })
    }
  }

  getCountries() {
    this.userApiService.getCountries().subscribe((res: any) => {
      this.countries = res.map((country: any, index: number) => ({ ...country, index }));
      this.resultcountries = res.map((country: any, index: number) => ({ ...country, index }));
      this.initializeCheckboxes();
    });
  }

  selectDate(date: any) {
    this.selectedDate = date?.value;
    const today = new Date();
    let fromDate = today;
    let toDate = today;
    this.showdate = true;
    switch (this.selectedDate) {
      case 'Yesterday':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 1);
        this.datepickCount = 1;
        break;
      case DATE_OPTION_SEVENDAYS:
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
        this.datepickCount = 1;
        break;
      case DATE_OPTION_THIRTYDAYS:
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        this.datepickCount = 1;
        break;
      case DATE_OPTION_SIXTYDAYS:
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 60);
        this.datepickCount = 1;
        break;
      case DATE_OPTION_NINETYDAYS:
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 90);
        this.datepickCount = 1;
        break;
      default:
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
    }
    const orderFromDate = fromDate.toISOString().split('T')[0];
    const orderToDate = toDate.toISOString().split('T')[0];
    this.fromDateFilter = orderFromDate;
    this.toDateFilter = orderToDate;
    this.dataState.setDateFilter({
      startDate: this.fromDateFilter,
      endDate: this.toDateFilter
    });
    this.searchText();
  }

  selectLink(link: string) {
    this.selectedLink = link;
    this.dataState.setorderLinkTypeSetting(link);
    
    switch (link) {
      case TAB_VALUE_NEEDSAPPROVAL:
        this.currentLink = "1,2,3,5,7"
        break;
      case TAB_VALUE_APPROVED:
        this.currentLink = "6,8,9"
        break;
      case TAB_VALUE_DECLINED:
        this.currentLink = "10"
        break;
      default:
        this.currentLink = "1,2,3,5,7"
    }
    this.dataState.setselectedPageNo(0);
    this.searchText();
  }

  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }

  clearAll() {
    this.selectedCountries = [];
    this.filterForm.reset();
    this.selectedCountries = [];
    this.selectedDate = undefined;
    this.countryCount = 0;
    this.datepickCount = 0;
    this.showCountryCount = false;
    this.showdate = false;
    const today = new Date();
    let fromDate = new Date(today);
    let toDate = new Date(today);
    fromDate.setDate(today.getDate() - 7);
    this.fromDateFilter = fromDate.toISOString().split('T')[0];
    this.toDateFilter = toDate.toISOString().split('T')[0];
    this.getCountries();
    this.searchText();
  }

  hideFilter(filter: boolean) {
    this.isFilterVisible = !filter;
  }

  searchText(searchValue?: any) {
    let searchedText = this.filterForm.controls['search'].value ? this.filterForm.controls['search'].value : searchValue;
    let filterArr = [];
    filterArr.push({
      fromDate: this.fromDateFilter,
      toDate: this.toDateFilter,
      selectedLink: this.currentLink,
      selectedCountries: this.selectedCountries,
      searchText: searchedText,
      dateFilterType: this.selectedDate == DATE_OPTION_SEVENDAYS ? DATE_OPTION_TODAY : DATE_OPTION_CUSTOM,
      pageIndex: 0,
    });
    this.dataState.setSelectedFilterData({
      currentLink: this.currentLink,
      selectedCountries: this.selectedCountries,
      searchedText: searchedText,
      dateFilterType: this.selectedDate == DATE_OPTION_SEVENDAYS ? DATE_OPTION_TODAY : DATE_OPTION_CUSTOM
    });
    this.searchTextValue.emit(filterArr);
  }

  clearDate() {
    this.datepickCount = undefined;
    this.selectedDate = undefined;
    this.filterForm.controls['datePick'].reset();
    this.datepickCount = 0;
    this.showdate = false;
    this.selectDate('');
    this.searchText();
  }

  clearCheckboxes() {
    this.filterForm.controls['Countrysearch'].reset();
    this.getCountries();
    const checkboxes = this.filterForm.get('country') as FormArray;

    // Reset all checkboxes to 'false' (unchecked)
    checkboxes.controls.forEach(control => control.setValue(false));
    this.selectedCountries = [];
    this.countryCount = 0;
    this.showCountryCount = false;
    this.searchText();
  }

  @HostListener('document:click', ['$event'])
  clickOutsideDropdown(event: Event) {
    if (this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }
}
