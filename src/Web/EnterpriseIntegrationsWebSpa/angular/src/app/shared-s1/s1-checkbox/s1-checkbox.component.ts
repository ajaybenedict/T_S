import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1Checkbox } from 'src/app/models/s1/s1-filter-checkbox.interface';

@Component({
  selector: 'app-s1-checkbox',
  templateUrl: './s1-checkbox.component.html',
  styleUrls: ['./s1-checkbox.component.css']
})
export class S1CheckboxComponent {
  @Input() inputData!: S1Checkbox;
  @Output() checked = new EventEmitter<S1Checkbox>();  // Emits change

  toggleCheck() {   
    if(this.inputData.disabled) return; // prevent click action in case of disabled.
    this.inputData.checked = !this.inputData.checked;
    this.inputData.indeterminate = false;
    this.checked.emit(this.inputData);
  }
}
