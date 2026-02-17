import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RowScrollService {
  private readonly scrollRowSubject = new BehaviorSubject<{ rowIndex: number, childIndex: number }>({ rowIndex: 0, childIndex: 0 });
  scrollRow$ = this.scrollRowSubject.asObservable();

  scrollToRow(rowIndex: number, childIndex: number = 0) {
    this.scrollRowSubject.next({ rowIndex, childIndex });
  }

}
