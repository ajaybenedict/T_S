import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';

@Component({
  selector: 'app-s1-filter-buttons',
  templateUrl: './s1-filter-buttons.component.html',
  styleUrls: ['./s1-filter-buttons.component.css'],
  standalone: false,
})
export class S1FilterButtonsComponent {
  @Input() input!: S1FilterButtons | null;
  @Output() btnClick = new EventEmitter<string>();
  @Output() closeBtnClick = new EventEmitter<string>();

  dismissBtnHandler(event: Event) {
    this.closeBtnClick.emit(this.input?.closeBtnClickEvent ?? 'close');
    event.stopPropagation();
  }

  btnClickHandler(eventName: string) {
   this.btnClick.emit(eventName);
  }
}
