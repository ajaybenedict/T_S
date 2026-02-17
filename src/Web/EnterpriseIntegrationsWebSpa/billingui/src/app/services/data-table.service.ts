import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataTableService {
  private readonly columnsSubject = new BehaviorSubject<any[]>([]);
  private readonly dataSubject = new BehaviorSubject<any[]>([]);
  private readonly tabSubject = new BehaviorSubject<string>('NONE');
  private readonly tableexpandableRowIdSubject = new BehaviorSubject<string | null>(null);
  private readonly selectedOrdersSubject = new BehaviorSubject<any>(null);
  private readonly selectedOrderLineItemSubject = new BehaviorSubject<string>('');
  

  columns$ = this.columnsSubject.asObservable();
  data$ = this.dataSubject.asObservable();
  tab$ = this.tabSubject.asObservable();
  tableexpandable$ = this.tableexpandableRowIdSubject.asObservable();
  selectedOrders$ = this.selectedOrdersSubject.asObservable();
  selectedOrderLineItem$ = this.selectedOrderLineItemSubject.asObservable();

  setColumns(columns: any[]) {
    this.columnsSubject.next(columns);
  }

  setData(data: any[]) {
    this.dataSubject.next(data);
  }

  setTab(tab: string) {
    this.tabSubject.next(tab);
  }  

  setTableExpandable(expandable: string | null) {
    this.tableexpandableRowIdSubject.next(expandable);
  }

  setSelectedOrders(orders: any) {
    this.selectedOrdersSubject.next(orders);
  }

  setSelectedOrderLineItem(orderLineItemId: string) {
    this.selectedOrderLineItemSubject.next(orderLineItemId);
  }
}