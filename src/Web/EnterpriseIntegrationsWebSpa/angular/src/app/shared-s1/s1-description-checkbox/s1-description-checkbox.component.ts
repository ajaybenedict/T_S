import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1Checkbox, S1DescriptionCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';

@Component({
  selector: 'app-s1-description-checkbox',
  templateUrl: './s1-description-checkbox.component.html',
  styleUrls: ['./s1-description-checkbox.component.css']
})
export class S1DescriptionCheckboxComponent {
  @Input() inputData!: S1DescriptionCheckbox[];
  @Output() checked = new EventEmitter<S1DescriptionCheckbox[]>();

  toggle(item: S1Checkbox) {
    if( !item || !this.inputData?.length) return;
    const foundItem = this.inputData.find(el => el.key == item.key);
    if(foundItem) {
      foundItem.checked = item.checked;
      this.emitOutput();
    }    
  }

  emitOutput() {
    this.checked.emit(this.inputData);
  }
}
