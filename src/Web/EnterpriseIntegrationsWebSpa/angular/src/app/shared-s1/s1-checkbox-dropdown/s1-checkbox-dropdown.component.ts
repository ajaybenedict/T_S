import { Component, Input, Output, EventEmitter } from '@angular/core';
import { S1Checkbox } from 'src/app/models/s1/s1-filter-checkbox.interface';
@Component({
  selector: 's1-checkbox-dropdown',
  templateUrl: './s1-checkbox-dropdown.component.html',
  styleUrls: ['./s1-checkbox-dropdown.component.css']
})
export class S1CheckboxDropdownComponent {
  @Input() inputData!: S1Checkbox[];
  @Input() title: string = 'Task Type';

  @Output() outputData = new EventEmitter<S1Checkbox[]>();  
  
  toggle(item: S1Checkbox) {
    if(!item || !this.inputData?.length) return;    
    const foundItem = this.inputData.find(el => el.key == item.key);
    if(foundItem) {
      foundItem.checked = item.checked;
      this.emitOutput();
    }    
  }

  emitOutput() {
    this.outputData.emit([...this.inputData]);
  }
  
}
