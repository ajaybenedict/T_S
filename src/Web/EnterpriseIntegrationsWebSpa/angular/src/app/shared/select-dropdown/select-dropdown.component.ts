import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';

/**
 * Select Dropdown Component with dynamic height and width management.
 * Implemented with Control Value Accessor (CVA) for use in reactive forms.
 * 
 * Features:
 * - Automatically adjusts dropdown width to match trigger element
 * - Dynamically calculates max-height based on available viewport space
 * - Handles window resize events
 * - Scrollable menu when options exceed available space
 * - Form control integration for validation
 * 
 * Usage: Use only in reactive forms. The component manages its own state via CVA.
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
  private static readonly MENU_ITEM_HEIGHT = 48;
  private static readonly MAX_VISIBLE_ITEMS = 5;
  private static readonly MENU_CONTENT_VERTICAL_PADDING = 24;

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

  /**
   * Angular lifecycle hook - called after view initialization.
   * Sets up subscriptions for menu open/close events.
   */
  ngAfterViewInit(): void {
    this.menuOpenSubs = this.menuTrigger.menuOpened.subscribe(res => {
      this.dropdownMenuStatus = 'Opened';
      this.setMenuWidth();
      this.setMenuHeight();
    });
    this.menuCloseSubs = this.menuTrigger.menuClosed.subscribe(res => this.dropdownMenuStatus = 'Closed');
  }

  /**
   * Sets the menu panel width to match the trigger element width.
   * Updates both the panel and the CDK overlay pane.
   * @private
   */
  setMenuWidth() {
    const triggerWidth = this.dropdownTrigger?.nativeElement.offsetWidth;
    const panelId = this.menuTrigger?.menu?.panelId;

    if (triggerWidth && panelId) {
      const panelEl = document.getElementById(panelId);
      const overlayPane = panelEl?.closest('.cdk-overlay-pane') as HTMLElement | null;

      if (panelEl) {
        panelEl.style.width = `${triggerWidth}px`;
        panelEl.style.maxWidth = `${triggerWidth}px`;
      }

      if (overlayPane) {
        overlayPane.style.width = `${triggerWidth}px`;
        overlayPane.style.maxWidth = `${triggerWidth}px`;
      }
    }
  }

  /**
   * Sets a fixed dropdown menu height of 5 items and enables scrolling.
   * @private
   */
  private setMenuHeight(): void {
    const fixedMenuHeight =
      (SelectDropdownComponent.MAX_VISIBLE_ITEMS * SelectDropdownComponent.MENU_ITEM_HEIGHT)
      + SelectDropdownComponent.MENU_CONTENT_VERTICAL_PADDING;
    const panelId = this.menuTrigger?.menu?.panelId;

    if (panelId) {
      const panelEl = document.getElementById(panelId);
      
      if (panelEl) {
        panelEl.style.maxHeight = `${fixedMenuHeight}px`;
        panelEl.style.overflowY = 'auto';
      }
    }
  }

  /**
   * Handles window resize events.
   * Recalculates and updates menu dimensions when window is resized while menu is open.
   * @private
   */
  @HostListener('window:resize')
  onMenuResize(): void {
    if (this.dropdownMenuStatus === 'Opened') {
      this.setMenuWidth();
      this.setMenuHeight();
    }
  }

  /** Callback function invoked when the dropdown value changes */
  private onChange: any = () => {};
  /** Callback function invoked when the dropdown is touched/menu is triggered */
  private onTouched: any = () => {};

  /**
   * Handles selection of a dropdown option.
   * Updates the component value, notifies the form control, and marks as touched.
   * @param {SelectDropdown} option - The selected option
   */
  selectOption(option: SelectDropdown): void {
    this.value = option;
    this.onChange(this.value);
    this.markAsTouched();
  }

  /**
   * Marks the form control as touched.
   * Only triggers the onTouched callback once.
   */
  markAsTouched(): void {
    if (!this.isTouched) {
      this.onTouched();
      this.isTouched = true;
    }
  }

  /**
   * ControlValueAccessor method - writes a value to the component.
   * @param {SelectDropdown} value - The value to write
   */
  writeValue(value: SelectDropdown): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  /**
   * ControlValueAccessor method - registers callback for value changes.
   * @param {Function} fn - Callback function to invoke on value change
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * ControlValueAccessor method - registers callback for touch events.
   * @param {Function} fn - Callback function to invoke on touch
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * ControlValueAccessor method - updates the disabled state.
   * @param {boolean} isDisabled - Whether the control is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * Validator method - validates the form control.
   * Returns validation error if the field is required but has no value.
   * @param {AbstractControl} control - The form control to validate
   * @returns {ValidationErrors | null} Validation errors or null if valid
   */
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.value) {
      return { required: true };
    }
    return null;
  }

  /**
   * Angular lifecycle hook - called when component is destroyed.
   * Unsubscribes from menu subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if(this.menuCloseSubs) this.menuCloseSubs.unsubscribe();
    if(this.menuOpenSubs) this.menuOpenSubs.unsubscribe();
  }
}
