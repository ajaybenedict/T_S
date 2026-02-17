// side-panel.ref.ts
import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

export class SidePanelRef<TData = unknown, TResult = unknown> {
  private readonly closedSubject = new Subject<TResult | undefined>();

  constructor(private readonly overlayRef: OverlayRef) {}

  close(result?: TResult): void {
    this.overlayRef.dispose();
    this.closedSubject.next(result);
    this.closedSubject.complete();
  }

  afterClosed(): Observable<TResult | undefined> {
    return this.closedSubject.asObservable();
  }
}