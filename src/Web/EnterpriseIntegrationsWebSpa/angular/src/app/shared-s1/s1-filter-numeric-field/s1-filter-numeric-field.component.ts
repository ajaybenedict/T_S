import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { S1FilterNumericFieldInput, S1FilterNumericFieldOutput } from 'src/app/models/s1/s1-filter-numeric-field.interface';

@Component({
  selector: 'app-s1-filter-numeric-field',
  templateUrl: './s1-filter-numeric-field.component.html',
  styleUrls: ['./s1-filter-numeric-field.component.css'],
  standalone: false,  
})

export class S1FilterNumericFieldComponent implements OnInit, OnChanges {
  
  @Input() declare inputData: S1FilterNumericFieldInput;
  @Output() minMaxFilterOutput = new EventEmitter<S1FilterNumericFieldOutput>();

  placeholder: string = '0.0';
  isMinFocused: boolean = false;
  isMaxFocused: boolean = false;
  maxClearBtn: boolean = false;
  minClearBtn: boolean = false;
  enableValidation: boolean  = false;

  declare min: number | null;
  declare max: number | null;

  ngOnInit(): void {
    this.processMinMaxValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['inputData']) {
      this.processMinMaxValue();
    }
  }

  processMinMaxValue() {
    this.min = this.normalizeZeroToNull(this.inputData?.min);
    this.max = this.normalizeZeroToNull(this.inputData?.max);     
  }

  private normalizeZeroToNull(value: number | null | undefined): number | null {
    return value === 0 ? null : value ?? null;
  }
  
  focusHandler(type: string, value: boolean) {
    if(type == 'max') this.isMaxFocused = value;
    if(type == 'min') this.isMinFocused = value;
  }

  keyUpHandler(type: string) {
    this.setClearBtn(type);
    this.compareValue();
  }

  setClearBtn(type: string) {
    if(type == 'min') this.minClearBtn = Boolean(this.min);
    if(type == 'max') this.maxClearBtn = Boolean(this.max);
  }

  clearBtnHandler(type: string) {
    if(type=='min') this.min = null;
    if(type=='max') this.max = null;
    this.setClearBtn(type);
    this.compareValue();
  }

  compareValue() {
    if (this.min && this.max) {
      this.enableValidation = this.min >= this.max;
      if (!this.enableValidation) {
        const value: S1FilterNumericFieldOutput = {min: this.min, max: this.max}
        this.minMaxFilterOutput.emit(value);
      }
    } else {
      this.enableValidation = true;
    }    
  }
}
