import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';

@Component({
  selector: 'app-s1-filter-button-container',
  templateUrl: './s1-filter-button-container.component.html',
  styleUrls: ['./s1-filter-button-container.component.css'],
  standalone: false,
})
export class S1FilterButtonContainerComponent {

  @Input() btnList!: S1FilterButtons[];
  @Output() btnClick = new EventEmitter<S1FilterButtons | string>();  
  
  btnClickHandler(btn: S1FilterButtons) {
    if (!btn || !this.btnList?.length) return;
    const prevBtn = this.btnList?.find(el => el.selected);
    if(prevBtn) prevBtn.selected = !prevBtn.selected;

    const currBtn = this.btnList.find(el => el.displayName == btn.displayName);
    if(currBtn) currBtn.selected = true;

    this.emitOutput(btn);
  }

  emitOutput(value: S1FilterButtons | string) {
    this.btnClick.emit(value);
  }
}
