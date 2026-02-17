import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { S1TableColumnManager } from 'src/app/models/s1/s1-table-column-manager.interface';

@Component({
  selector: 's1-table-column-manager',
  templateUrl: './s1-table-column-manager.component.html',
  styleUrls: ['./s1-table-column-manager.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0%)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('out => in', [animate('300ms ease-in')]),
      transition('in => out', [animate('300ms ease-out')])
    ])
  ]
})

export class S1TableColumnManagerComponent implements OnInit {
  
  private _columns: S1TableColumnManager[] = [];

  @Input()
  set columns(value: S1TableColumnManager[]) {
    // create defensive copy so child never mutates parent's array
    this._columns = (value ?? []).map(c => ({ ...c }));
    this.resetTempColumns(); // re-init tempColumns whenever parent changes the input
  }
  get columns(): S1TableColumnManager[] {
    return this._columns;
  }

  @Input() visible: boolean = false; // Panel visibility toggle
  @Output() columnsChange = new EventEmitter<S1TableColumnManager[]>();
  @Output() panelClose = new EventEmitter<void>();
  @Output() resetToDefaultEmitter = new EventEmitter<void>();

  tempColumns: S1TableColumnManager[] = [];
  originalColumns: S1TableColumnManager[] = [];

  ngOnInit() {
    // setter already calls resetTempColumns on first input binding, but keep safe fallback
    if (!this.tempColumns?.length) this.resetTempColumns();
  }

  trackByColumn(index: number, col: S1TableColumnManager) {
    return col.columnKey;
  }

  private resetTempColumns() {
    this.originalColumns = this.columns.map(col => ({ ...col }));
    this.tempColumns = this.columns.map(col => ({ ...col }));
  }

  drop(event: CdkDragDrop<S1TableColumnManager[]>) {
    moveItemInArray(this.tempColumns, event.previousIndex, event.currentIndex);
  }

  toggleVisibility(col: S1TableColumnManager) {
    col.visible = !col.visible;
  }

  applyChanges() {
    this.columnsChange.emit(this.tempColumns.map(col => ({ ...col })));
    this.originalColumns = this.tempColumns.map(col => ({ ...col }));
    this.closePanel();
  }

  resetToDefault() {    
    this.resetToDefaultEmitter.emit();
    this.closePanel();
  }

  closePanel() {    
    this.panelClose.emit();
  }
}
