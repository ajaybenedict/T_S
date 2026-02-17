import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1DropDownButton } from 'src/app/models/s1/s1-drop-down-button.interface';

@Component({
  selector: 's1-drop-down-button',
  templateUrl: `./s1-drop-down-button.component.html`,
  styleUrls: ['./s1-drop-down-button.component.css']
})
export class S1DropDownButtonComponent {
  @Input() inputData!: S1DropDownButton;
  @Output() actionEmitter = new EventEmitter<string>();

  menuClickHandler(value: string) {
    this.actionEmitter.emit(value);
  }
}
