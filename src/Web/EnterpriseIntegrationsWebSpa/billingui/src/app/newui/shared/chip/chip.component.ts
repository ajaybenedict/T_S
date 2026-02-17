import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.css']
})
export class ChipComponent {
  @Input() chipText = '';
  @Output() dismissClick = new EventEmitter<string>();
  dismissHandler() {
    this.dismissClick.emit(this.chipText);
  }
}


