import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TableColumn } from 'src/app/interface/data-table-columns.interface';
import { TraverseStateService } from 'src/app/services/traverse-state.service';
import { DataTableService } from 'src/app/services/data-table.service';


@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  @Output() clickedRow = new EventEmitter<{ row: any; index: number }>();

  @Input() expandableRows = false;

  originalData: any[] = [];

  expandedRowId: string | null = null;
  tbodyExpanded = false;

  @Output() tableIdGenerated = new EventEmitter<string>();


  displayedColumns: string[] = [];
  tableDataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  fullDisplayedColumns: string[] = [];

  tableId: string = '';

  constructor(
    private readonly traverseService: TraverseStateService,
    private readonly dataTableService: DataTableService) { }

  onRowClick(row: any, i: number) {

    this.clickedRow.emit({ row, index: i });
    if (this.expandableRows) {
      if (this.expandedRowId === row.salesOrderLineId) {
        this.dataTableService.setTableExpandable(null);
        this.tableDataSource.data = [...this.originalData];
        this.tbodyExpanded = false;
      } else {
        this.dataTableService.setTableExpandable(row.salesOrderLineId);
        this.tableDataSource.data = [row];
        this.tbodyExpanded = true;
        this.traverseService.setTraverse(this.tableId, i, this.originalData.length);
      }

      this.dataTableService.tableexpandable$.subscribe(expandable => {
        this.expandedRowId = expandable;

        if (!expandable) {
          this.tableDataSource.data = [...this.originalData];
          this.tbodyExpanded = false;
        }
      });
    }
  }

  updateTable(columns: TableColumn[], data: any[]) {
    if (!columns || !data) return;

    this.columns = columns;
    this.data = data;

    this.originalData = [...data];

    if (this.expandableRows) {
      this.tableId = `expandable-table-${Math.random().toString(36).substr(2, 9)}`;
      this.traverseService.registerTable(this.tableId, this.originalData.length);
      this.tableIdGenerated.emit(this.tableId);

      this.traverseService.expandRow$(this.tableId)?.subscribe((index: number) => {
        const row = this.originalData[index];
        if (row) {
          this.expandedRowId = null;
          this.onRowClick(row, index);
        }
      });
    }

    this.displayedColumns = this.columns
      .map(col => col.columnName);

    this.fullDisplayedColumns = this.displayedColumns;

    this.data = data.map(row => {
      const rowObj: any = { ...row };
      return rowObj;
    });
    this.tableDataSource = new MatTableDataSource(this.data);
    this.selection.clear();
  }


  getStickyClass(column: TableColumn): string {
    if (!column.stickyPosition) return '';
    const base = column.stickyPosition === 'left' ? 'sticky-left-' : 'sticky-right-';
    return `${base}${column.stickyIndex ?? 0}`;
  }


}
