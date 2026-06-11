import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Button } from 'src/app/interface/button.interface';

@Component({
  selector: 'app-traverseinfo-component',
  templateUrl: './traverseinfo-component.component.html',
  styleUrls: ['./traverseinfo-component.component.css']
})
export class TraverseinfoComponentComponent {
  @Input() currentIndex = 0;
  @Input() total = 0;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<number>();

  backbutton: Button[] = [{
    key: 'BackToList',
    label: 'Back to List',
    icon: '/cbc/BackToList',
    showLabel: true,
    showIcon: true,
    disabled: false,
    class: 'btn-action'
  }];
}