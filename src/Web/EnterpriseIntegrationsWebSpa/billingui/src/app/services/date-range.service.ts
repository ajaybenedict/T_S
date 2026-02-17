import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DateRangeService {
  private dateRangeSubject = new BehaviorSubject<{ start: string; end: string } | null>(null);
  dateRange$ = this.dateRangeSubject.asObservable();

  setDateRange(range: { start: string; end: string }) {
    this.dateRangeSubject.next(range);
  }

  getDateRange(): { start: string; end: string } | null {
    return this.dateRangeSubject.value;
  }
}
