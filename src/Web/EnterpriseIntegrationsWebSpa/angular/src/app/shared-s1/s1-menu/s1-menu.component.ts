import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { S1Menu } from 'src/app/models/s1/s1-menu.interface';

@Component({
  selector: 'app-s1-menu',
  templateUrl: './s1-menu.component.html',
  styleUrls: ['./s1-menu.component.css'],
  standalone: false,
})
export class S1MenuComponent implements AfterViewInit{

  @Input() declare inputData: S1Menu;
  @Output() actionEmitter = new EventEmitter<string>();
  @Output() menuClosed = new EventEmitter<boolean>();
  @Output() menuOpened = new EventEmitter<boolean>();

  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;

  onClickHandler(value: string) {
    this.actionEmitter.emit(value);
  }

  ngAfterViewInit(): void {
    this.menuTrigger.menuOpened.subscribe(() => {
      this.menuOpened.emit(true);
    });
    this.menuTrigger.menuClosed.subscribe(() => {
      this.menuClosed.emit(true);
    });
  }
}
