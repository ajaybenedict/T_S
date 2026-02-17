import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LogicalOperator } from 'src/app/models/rule-engine/rule-engine';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';

@Component({
  selector: 'app-logical-operator',
  template: `
    <div class="d-flex" style="gap:12px;">
      <app-s1-filter-buttons [input]="andOperator" (btnClick)="clickHandler('And')"></app-s1-filter-buttons>
      <app-s1-filter-buttons [input]="orOperator" (btnClick)="clickHandler('Or')"></app-s1-filter-buttons>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LogicalOperatorComponent),
      multi: true
    }
  ]
})
export class LogicalOperatorComponent implements ControlValueAccessor {

  andOperator: S1FilterButtons = {
    displayName: 'And',
    selected: true,
    type: 'filter',
    hasCloseBtn: false,
    onClickEvent: 'And', 
  };
  
  orOperator: S1FilterButtons = {
    displayName: 'Or',
    selected: false,
    type: 'filter',
    hasCloseBtn: false,
    onClickEvent: 'Or',
  };

  declare selectedOperator: 'And' | 'Or';

  // ControlValueAccessor callbacks
  private onChange: (value: 'And' | 'Or') => void = () => {};
  private onTouched: () => void = () => {};
  disabled = false;

  clickHandler(event: 'And' | 'Or') {
    if (this.disabled) return;

    const prev = this.selectedOperator;
    this.selectedOperator = event;
    this.updateSelectionState();

    if (prev !== this.selectedOperator) {
      this.onChange(this.selectedOperator);  // Notify form      
    }
    this.onTouched(); // Mark as touched
  }

  private updateSelectionState() {
    this.andOperator.selected = this.selectedOperator === 'And';
    this.orOperator.selected = this.selectedOperator === 'Or';
  }
  
  // ControlValueAccessor implementation
  writeValue(value: 'And' | 'Or' | LogicalOperator): void {    
    if (value) {
      this.selectedOperator = typeof value === 'object' ? value.name as ('And' | 'Or') : value;
      this.updateSelectionState();
    }
  }

  registerOnChange(fn: (value: 'And' | 'Or') => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}