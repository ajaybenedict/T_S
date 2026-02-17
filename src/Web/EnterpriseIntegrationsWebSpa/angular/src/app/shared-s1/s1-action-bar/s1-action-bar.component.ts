import { Component, EventEmitter, Input, Output } from '@angular/core';
import { S1ActionBar } from 'src/app/models/s1/s1-action-bar.interface';

@Component({
  selector: 'app-s1-action-bar',
  templateUrl: './s1-action-bar.component.html',
  styleUrls: ['./s1-action-bar.component.css']
})
export class S1ActionBarComponent {
  
  @Input() inputData!: S1ActionBar;

  @Output() btnClick = new EventEmitter<string>();

  btnClickHandler(value: string) {
    if(value) this.btnClick.emit(value);
  }

}
