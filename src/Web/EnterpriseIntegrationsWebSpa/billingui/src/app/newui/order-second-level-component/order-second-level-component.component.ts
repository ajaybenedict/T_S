import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, filter, switchMap, takeUntil, tap } from 'rxjs';

import { ORDER_SECOND_LEVEL_TABLE_COLUMNS } from 'src/app/config/data-table-columns.config';
import { DataTableService } from 'src/app/services/data-table.service';
import { CBCDashboardAPIService } from 'src/app/services/cbcdashboard-api.service';

@Component({
  selector: 'app-order-second-level-component',
  templateUrl: './order-second-level-component.component.html',
  styleUrls: ['./order-second-level-component.component.css']
})
export class OrderSecondLevelComponent implements OnInit, OnDestroy {

  columns = ORDER_SECOND_LEVEL_TABLE_COLUMNS;
  data: any[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dataTableService: DataTableService,
    private readonly apiService: CBCDashboardAPIService
  ) {}

 ngOnInit(): void {
  this.dataTableService.selectedOrderLineItem$
    .pipe(
      tap(value => console.log('selectedOrderLineItem$ emitted:', value)),

      filter((id): id is string => {
        const valid = !!id;
        return valid;
      }),

      switchMap(orderLineItemId => {
        return this.apiService.getOrderLineItemDetails(orderLineItemId);
      }),

      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response) => {
        this.data = response;
      },
      error: (err) => {
        console.error('API failed:', err);
      }
    });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}