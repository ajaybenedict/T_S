import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1Checkbox } from 'src/app/models/s1/s1-filter-checkbox.interface';

@Component({
  selector: 'app-s1-flat-checkbox',
  templateUrl: './s1-flat-checkbox.component.html',
  styleUrls: ['./s1-flat-checkbox.component.css']
})
export class S1FlatCheckboxComponent {
  @Input() inputData!: S1Checkbox[];  
  @Output() checked = new EventEmitter<S1Checkbox[]>();

  toggle(item: S1Checkbox) {
    if(!item || !this.inputData?.length) return;    
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
