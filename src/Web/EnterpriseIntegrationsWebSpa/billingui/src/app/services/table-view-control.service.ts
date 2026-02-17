import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ExpandState {
  isExpanded: boolean;
  source: 'toolbar' | 'row';
}

@Injectable({
  providedIn: 'root'
})
export class TableViewControlService {
  private readonly expandStateSubject = new BehaviorSubject<ExpandState>({ isExpanded: false, source: 'toolbar' });
  isExpanded$ = this.expandStateSubject.asObservable();

  toggleGroups() {
    const current = this.expandStateSubject.value;
    this.expandStateSubject.next({
      isExpanded: !current.isExpanded,
      source: 'toolbar'  // toggled from toolbar button
    });
  }

  setExpandState(expanded: boolean): void {
    this.expandStateSubject.next({
      isExpanded: expanded,
      source: 'row'  // toggled from single group row
    });
  }

  get currentState(): boolean {
    return this.expandStateSubject.value.isExpanded;
  }
}
