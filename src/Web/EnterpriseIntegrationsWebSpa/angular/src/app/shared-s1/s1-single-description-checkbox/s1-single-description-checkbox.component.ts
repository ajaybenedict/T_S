import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1Checkbox, S1DescriptionCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';

@Component({
  selector: 'app-s1-single-description-checkbox',
  templateUrl: './s1-single-description-checkbox.component.html',
  styleUrls: ['./s1-single-description-checkbox.component.css']
})
export class S1SingleDescriptionCheckboxComponent {
  @Input() inputData: S1DescriptionCheckbox[] = [];
  @Output() checked = new EventEmitter<S1DescriptionCheckbox[]>();

  /**
   * Enforces a single selected option at a time.
   * Clicking a checked item toggles it off and results in no selection.
   */
  toggle(item: S1Checkbox): void {
    if (!item || !this.inputData?.length) {
      return;
    }

    this.inputData = this.inputData.map(option => {
      if (option.key === item.key) {
        return {
          ...option,
          checked: item.checked,
        };
      }

      return {
        ...option,
        checked: false,
      };
    });

    this.emitOutput();
  }

  emitOutput(): void {
    this.checked.emit(this.inputData);
  }
}
