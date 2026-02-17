import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PPCPageChangeEventData, PPCPaginatorData } from 'src/app/models/ppc-paginator.model';

@Injectable({
  providedIn: 'root'
})
export class PpcPaginatorDataService {

  private ppcPaginatorData = new BehaviorSubject<PPCPaginatorData | null>(null);
  private ppcPageChangeEventData = new BehaviorSubject<PPCPageChangeEventData | null>(null);

  ppcPaginatorData$ = this.ppcPaginatorData.asObservable();
  ppcPageChangeEventData$ = this.ppcPageChangeEventData.asObservable();

  setPPCPaginatorData(data: PPCPaginatorData | null) {
    this.ppcPaginatorData.next(data);
  }

  setPPCPageChangeEventData(data: PPCPageChangeEventData | null) {
    this.ppcPageChangeEventData.next(data);
  }
  
}
