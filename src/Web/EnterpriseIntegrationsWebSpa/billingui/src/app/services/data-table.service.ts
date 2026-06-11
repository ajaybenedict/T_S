import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataTableService {
  private readonly columnsSubject = new BehaviorSubject<any[]>([]);
  private readonly dataSubject = new BehaviorSubject<any[]>([]);
  private readonly tabSubject = new BehaviorSubject<string>('NONE');
  private readonly selectedOrdersSubject = new BehaviorSubject<any>(null);
  private readonly selectedOrderLineItemSubject = new BehaviorSubject<string>('');
  private readonly errorSubject = new BehaviorSubject<boolean>(false);
  private templates: Record<string, TemplateRef<any>> = {};

  columns$ = this.columnsSubject.asObservable();
  data$ = this.dataSubject.asObservable();
  tab$ = this.tabSubject.asObservable();  
  error$ = this.errorSubject.asObservable();

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

  setSelectedOrders(orders: any) {
    this.selectedOrdersSubject.next(orders);
  }

  setSelectedOrderLineItem(orderLineItemId: string) {
    this.selectedOrderLineItemSubject.next(orderLineItemId);
  }

  setTemplates(templates: Record<string, TemplateRef<any>>) {
    this.templates = templates;
  }

  setError(value: boolean): void {
    this.errorSubject.next(value);
  }

  getTemplate(id: string): TemplateRef<any> | null {
    return this.templates[id] || null;
  }
}