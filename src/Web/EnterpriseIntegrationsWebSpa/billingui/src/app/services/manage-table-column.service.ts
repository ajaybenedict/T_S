import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ColumnConfig } from '../interface/manage-column.interface';

@Injectable({ providedIn: 'root' })
export class ManageColumnService {
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private readonly columnsSubject = new BehaviorSubject<{ tabname: string, columns: ColumnConfig[] }>({
    tabname: '',
    columns: []
  });

  private readonly orderdetails_updatedcolumns_subject = new BehaviorSubject<ColumnConfig[]>([]);
  
  
  columns$ = this.columnsSubject.asObservable();
  orderdetails_updatedcolumns$ = this.orderdetails_updatedcolumns_subject.asObservable();


  open() {
    this.isOpenSubject.next(true);
  }

  close() {
    this.isOpenSubject.next(false);
  }

  updateColumns(tabname: string, updatedColumns: ColumnConfig[]) {
    this.columnsSubject.next({ tabname, columns: updatedColumns });
  }

  setOrderDetailsUpdatedColumns(columns: any) {
    this.orderdetails_updatedcolumns_subject.next(columns);
  }
}