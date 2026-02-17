import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CheckBox } from 'src/app/interface/button.interface';

@Component({
  selector: 'app-reorderable-button',
  templateUrl: './reorderable-button.component.html',
  styleUrls: ['./reorderable-button.component.css']
})
export class ReorderableButtonComponent {
  @Input() label: string = '';
  @Input() visible: boolean = true;
  @Output() toggledcolumn = new EventEmitter<void>();
  @Input() hasCheckboxButton: boolean = false;
  @Input() checkBoxData: CheckBox[] = [];

  

  onToggle() {
    this.toggledcolumn.emit();
  }
}
