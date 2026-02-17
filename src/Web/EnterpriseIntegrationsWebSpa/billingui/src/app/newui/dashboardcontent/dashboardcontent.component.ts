import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableService } from 'src/app/services/data-table.service';
import { DataTableComponent } from '../shared/data-table/data-table.component';
import { MatSidenav } from '@angular/material/sidenav';
import { DialogService } from 'src/app/services/confirm-dialog.service';
import { ConfirmDialogConfig } from 'src/app/interface/confirm-dialog.interface';
import { TABS, COLUMNS, ACTIONEDCOLUMNS, DOWNLOAD_TABS } from 'src/app/config/manage-columns.config';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboardcontent',
  templateUrl: './dashboardcontent.component.html',
  styleUrls: ['./dashboardcontent.component.css']
})
export class DashboardcontentComponent implements OnInit,OnDestroy{

  isSidePanelOpen = false;
  tabs = TABS;
  columns = COLUMNS;
  downloadTabs = DOWNLOAD_TABS;

  @ViewChild('drawer') drawer!: MatSidenav;

  @Output() selectionCountChanged = new EventEmitter<number>();

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  private readonly destroy$ = new Subject<void>();


  constructor(private readonly dataTableService: DataTableService,
    private readonly dialogService: DialogService) { }

  ngOnInit(): void {
    this.dataTableService.tab$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tab) => {
        this.columns = tab === 'NONE' ? COLUMNS : ACTIONEDCOLUMNS;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  invoiceAction(event: { key: string, selectedOrders: any, position: string, event?: MouseEvent }): void {
    const { key, selectedOrders, position, event: mouseevent } = event;

    const placement = ['above', 'below', 'center'].includes(position)
      ? position as 'above' | 'below' | 'center'
      : 'center';
    this.showConfirmationDialog(key, placement, mouseevent);

  }


  showConfirmationDialog(actionKey: string, placement: 'above' | 'below' | 'center', event?: MouseEvent): void {
    const config: ConfirmDialogConfig = {
      title: actionKey,
      message: `Are you sure you want to ${actionKey} this invoice?`,
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      placement: placement,
      width: 600,
      confirmCallback: () => {
        console.log(`Confirmed ${actionKey}`);
      }
    };

    this.dialogService.openConfirmDialog(config, event);
  }

  onRowSelected(row: any) {
    this.dataTableService.setSelectedOrders(row);
    this.isSidePanelOpen = true;
  }
  
  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }


  closeSidePanel() {
    this.isSidePanelOpen = false;
  }
}
