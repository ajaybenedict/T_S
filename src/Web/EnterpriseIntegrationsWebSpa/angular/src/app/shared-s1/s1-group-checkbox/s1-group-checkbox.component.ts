import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { S1Checkbox, S1GroupCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';

@Component({
  selector: 'app-s1-group-checkbox',
  templateUrl: './s1-group-checkbox.component.html',
  styleUrls: ['./s1-group-checkbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class S1GroupCheckboxComponent implements OnInit {

  @Input() inputData!: S1GroupCheckbox;
  @Output() checked = new EventEmitter<S1GroupCheckbox>();

  declare groupTitle: S1Checkbox;

  ngOnInit(): void {
    if(this.inputData) {
      const allChecked = this.inputData.checkboxes.find(el => !el.checked);
      this.groupTitle = {
        displayName: this.inputData.groupTitle,
        key: this.inputData.groupTitle,
        checked: !allChecked,        
      };
    };
    this.toggleIndeterminate();
  }

  toggleGroup() {
    // Ignore the disabled one
    for(const el of this.inputData.checkboxes) {
      if(!el.disabled) el.checked = this.groupTitle.checked;
    }
    this.emitOutput();
  }

  toggleCheckbox() {
    this.toggleIndeterminate();
    this.emitOutput();
  }

  toggleIndeterminate() {
    // Ignore the disabled one
    const enabledItems = this.inputData.checkboxes.filter(el=>!el.disabled);
    const totalCount = this.inputData.checkboxes.length;
    const checkedCount = enabledItems.filter(el=>el.checked).length;    
    this.groupTitle.checked = checkedCount === totalCount;
    this.groupTitle.indeterminate = checkedCount > 0 && checkedCount < totalCount;
  }

  emitOutput() {
    this.checked.emit(this.inputData);
  }

}
