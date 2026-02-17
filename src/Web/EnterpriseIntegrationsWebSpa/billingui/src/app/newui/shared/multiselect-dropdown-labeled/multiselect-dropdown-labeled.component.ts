import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectDropdown } from 'src/app/interface/button.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-multiselect-dropdown-labeled',
  templateUrl: './multiselect-dropdown-labeled.component.html',
  styleUrls: ['./multiselect-dropdown-labeled.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectDropdownLabeledComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MultiselectDropdownLabeledComponent),
      multi: true
    }
  ]
})
export class MultiselectDropdownLabeledComponent implements ControlValueAccessor, Validator, AfterViewInit, OnDestroy, OnInit, OnChanges {

  value: SelectDropdown | null = null;
  selectedOptions: SelectDropdown[] = [];
  availableOptions: SelectDropdown[] = [];

  isTouched = false;
  isDisabled = false;
  dropdownMenuStatus: 'Opened' | 'Closed' = 'Closed';

  @Input() label = 'Select';
  @Input() options: SelectDropdown[] = [];
  @Input() required: boolean = false;
  @Input() width: string = '100%';

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('s1DropdownTrigger', { static: false }) dropdownTrigger!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();


  constructor() { }

  ngOnInit(): void {
    this.updateAvailableOptions();
  }

  ngAfterViewInit(): void {
    this.menuTrigger.menuOpened
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dropdownMenuStatus = 'Opened';
        this.setMenuWidth();
      });

    this.menuTrigger.menuClosed
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dropdownMenuStatus = 'Closed';
      });


  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  ngOnChanges(): void {
    this.updateAvailableOptions();
  }


  private updateAvailableOptions(): void {
    this.availableOptions = this.options.filter(
      opt => !this.selectedOptions.some(sel => sel.value === opt.value)
    );
  }




  setMenuWidth() {
    const triggerWidth = this.dropdownTrigger?.nativeElement.offsetWidth;
    if (triggerWidth) {
      const el = document.querySelector('.cdk-overlay-pane .custom-menu') as HTMLElement;
      if (el) el.style.width = `${triggerWidth}px`;
    }
  }

  // Callbacks
  private onChange: any = () => { };
  private onTouched: any = () => { };

  selectOption(option: SelectDropdown): void {
    this.selectedOptions.push(option);
    this.availableOptions = this.availableOptions.filter(opt => opt.value !== option.value); // Remove selected from available options
    this.onChange(this.selectedOptions); // Notify the parent form about the selected options
    this.markAsTouched();
  }

  removeChip(option: SelectDropdown): void {
    this.selectedOptions = this.selectedOptions.filter(opt => opt.value !== option.value); // Remove chip
    this.availableOptions.push(option); // Add it back to the dropdown options
    this.onChange(this.selectedOptions); // Update parent form
    this.availableOptions.sort((a, b) => a.label.localeCompare(b.label)); // Optional: Sort the dropdown options
  }

  markAsTouched(): void {
    if (!this.isTouched) {
      this.onTouched();
      this.isTouched = true;
    }
  }

  // ControlValueAccessor 
  writeValue(value: SelectDropdown[] | null): void {
    this.selectedOptions = value ?? [];

    this.updateAvailableOptions();
  }


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // Validator
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.selectedOptions.length) {
      return { required: true };
    }
    return null;
  }


}
