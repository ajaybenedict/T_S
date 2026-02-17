import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ORDER_SECOND_LEVEL_TABLE_COLUMNS } from 'src/app/config/data-table-columns.config';
import { DataTableComponent } from '../shared/data-table/data-table.component';
import { DataTableService } from 'src/app/services/data-table.service';
import { CBCDashboardAPIService } from 'src/app/services/cbcdashboard-api.service';

@Component({
  selector: 'app-order-second-level-component',
  templateUrl: './order-second-level-component.component.html',
  styleUrls: ['./order-second-level-component.component.css']
})
export class OrderSecondLevelComponent implements OnInit {
  columns: any = ORDER_SECOND_LEVEL_TABLE_COLUMNS;
  data: any[] = [];
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;


  constructor(
      private readonly dataTableService: DataTableService,
      private readonly apiService: CBCDashboardAPIService,
      private readonly cdr: ChangeDetectorRef
    ) { }


   ngOnInit(): void {
  
      this.dataTableService.selectedOrderLineItem$.subscribe(orderLineItemId => {
        if (orderLineItemId) {
         
          this.apiService.getOrderLineItemDetails(orderLineItemId).subscribe({
            next: (response) => {
              this.data = response;

                if (this.dataTable) {
             this.dataTable.updateTable(this.columns, this.data);
             this.cdr.detectChanges();  // Manually trigger change detection
           }
                
            },
            error: (err) => {
              console.error('Failed to load order line items', err);
            }
          });
        }
      });
  
    }

 

}
