import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';

/* 
Implemented with CVA - No need of @Input/@Output.
Use it only for dropdowns in reactive form.
*/
@Component({
  selector: 'app-select-dropdown',
  templateUrl: './select-dropdown.component.html',
  styleUrls: ['./select-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDropdownComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectDropdownComponent),
      multi: true
    }
  ]
})
export class SelectDropdownComponent implements ControlValueAccessor, Validator, AfterViewInit, OnDestroy{

  declare value: SelectDropdown;
  isTouched = false;
  isDisabled = false;
  dropdownMenuStatus:'Opened' | 'Closed' = 'Closed';
  declare menuOpenSubs: Subscription;
  declare menuCloseSubs: Subscription;

  @Input() label = 'Select';
  @Input() options: SelectDropdown[] = [];
  @Input() required: boolean = false;
  @Input() width: string = '100%';

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('s1DropdownTrigger', {static: false}) dropdownTrigger!: ElementRef<HTMLElement>;  

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.menuOpenSubs = this.menuTrigger.menuOpened.subscribe(res => {
      this.dropdownMenuStatus = 'Opened';
      this.setMenuWidth();
    });
    this.menuCloseSubs = this.menuTrigger.menuClosed.subscribe(res => this.dropdownMenuStatus = 'Closed');
  }

  setMenuWidth() {
    const triggerWidth = this.dropdownTrigger?.nativeElement.offsetWidth;    
    if(triggerWidth) {
     const el =  document.querySelector('.cdk-overlay-pane .custom-menu') as HTMLElement;
     if(el) el.style.width = `${triggerWidth}px`;
    }
  }

  // Callbacks
  // Fn to call when the value of the dropdown changes
  private onChange: any = () => {};
  // Fn to call when the dropdown is touched/ menu is triggered
  private onTouched: any = () => {};

  selectOption(option: SelectDropdown): void {
    this.value = option;
    this.onChange(this.value);
    this.markAsTouched();
  }

  markAsTouched(): void {
    if (!this.isTouched) {
      this.onTouched();
      this.isTouched = true;
    }
  }

  // ControlValueAccessor
  writeValue(value: SelectDropdown): void {
    this.value = value;
    this.cdr.markForCheck();
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
    if (this.required && !this.value) {
      return { required: true };
    }
    return null;
  }

  ngOnDestroy(): void {
    if(this.menuCloseSubs) this.menuCloseSubs.unsubscribe();
    if(this.menuOpenSubs) this.menuOpenSubs.unsubscribe();
  }
}
