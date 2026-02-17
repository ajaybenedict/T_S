import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class DownloadReportService {
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false);
  isDownloadPanelOpen$ = this.isOpenSubject.asObservable();
 
  open() {
    this.isOpenSubject.next(true);
  }

  close() {
    this.isOpenSubject.next(false);
  }

}