import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-s1-chip',
  templateUrl: './s1-chip.component.html',
  styleUrls: ['./s1-chip.component.css']
})
export class S1ChipComponent {
  @Input() chipText = '';
  @Output() dismissClick = new EventEmitter<string>();
  dimissHandler() {
    this.dismissClick.emit(this.chipText);
  }
}
