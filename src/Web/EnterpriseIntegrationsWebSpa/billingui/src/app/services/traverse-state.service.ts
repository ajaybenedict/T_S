import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TraverseStateService {
  private readonly tables = new Map<string, { 
    currentIndex: BehaviorSubject<number | null>, 
    totalRows: BehaviorSubject<number>, 
    expandRow: Subject<number> 
  }>();

  registerTable(tableId: string, totalRows: number) {
    this.tables.set(tableId, {
      currentIndex: new BehaviorSubject<number | null>(null),
      totalRows: new BehaviorSubject<number>(totalRows),
      expandRow: new Subject<number>()
    });
  }

  setTraverse(tableId: string, index: number, total: number) {
    const table = this.tables.get(tableId);
    if (!table) return;
    table.currentIndex.next(index + 1);
    table.totalRows.next(total);
  }

  expandRow$(tableId: string) {
    const table = this.tables.get(tableId);
    return table?.expandRow.asObservable();
  }

  currentIndex$(tableId: string) {
    return this.tables.get(tableId)?.currentIndex.asObservable();
  }

  totalRows$(tableId: string) {
    return this.tables.get(tableId)?.totalRows.asObservable();
  }

  goNext(tableId: string) {
   
    const table = this.tables.get(tableId);
    if (!table) return;
    const current = table.currentIndex.getValue();
    const total = table.totalRows.getValue();
    if (current !== null && current < total) {
      table.expandRow.next(current);
    }
  }

  goPrev(tableId: string) {
    const table = this.tables.get(tableId);
    if (!table) return;
    const current = table.currentIndex.getValue();
    if (current !== null && current > 1) {
      table.expandRow.next(current - 2);
    }
  }
}
