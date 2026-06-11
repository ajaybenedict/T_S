import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Type, 
  Output,
  EventEmitter
} from '@angular/core';

import { FlattenedTableColumns } from 'src/app/interface/data-table-columns.interface';
import { DataTableService } from 'src/app/services/data-table.service';

@Component({
  selector: 'app-expanded-table-view-template',
  templateUrl: './expanded-table-view-template.component.html'
})
export class ExpandedTableViewTemplateComponent implements OnChanges {

  @Input() data: any[] = [];
  @Input() columns: FlattenedTableColumns[] = [];
  @Input() rowKey: string = '';
  @Input() expandedComponent!: Type<any>;
  @Input() selectedRowId: string | null = null;
  @Input() navigationMode: boolean = false;

  @Output() rowSelected = new EventEmitter<any>();

  flattenedColumns: FlattenedTableColumns[] = [];
  flattenedData: any[] = [];
  uniqueKey: string = '';
  expandedRows: any = {};

  constructor(
    private readonly dataTableService: DataTableService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data']) {
      this.flattenedData = changes['data'].currentValue || [];
    }

    if (changes['columns']) {
      this.flattenedColumns = changes['columns'].currentValue || [];
    }

    if (changes['rowKey']) {
      this.uniqueKey = changes['rowKey'].currentValue || '';
    }

    if (changes['selectedRowId']) {
      this.selectedRowId = changes['selectedRowId'].currentValue || null;
        this.syncExpandedRows();

    }
  }

syncExpandedRows() {
  if (!this.selectedRowId) {
    this.expandedRows = {};
    return;
  }

  this.expandedRows = {
    [this.selectedRowId]: true
  };
}

  toggleExpandRow(rowData: any): void {
    const rowId = this.getRowId(rowData);
    // collapse
    if (this.selectedRowId === rowId) {

      this.selectedRowId = null;
      this.expandedRows = {};

      return;
    }

    // expand clicked row only
    this.selectedRowId = rowId;

    this.expandedRows = {
      [rowId]: true
    };
    this.rowSelected.emit(rowData);
  }

  getTemplate(id: string) {
    return this.dataTableService.getTemplate(id);
  }

  resolveValue(col: any, data: any) {

    if (typeof col.valueGetter === 'function') {
      return col.valueGetter(data);
    }

    return data?.[col.key] ?? '';
  }

  getRowId(rowData: any): string {
    return rowData?.[this.uniqueKey];
  }
}