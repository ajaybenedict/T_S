import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { S1CardDataTableColumn } from 'src/app/models/s1/s1-card-data-table.interface';

@Component({
  selector: 'app-s1-card-data-table',
  templateUrl: './s1-card-data-table.component.html',
  styleUrls: ['./s1-card-data-table.component.css'], 
  standalone: false,
})
export class S1CardDataTableComponent implements OnInit {
  declare dataSource: MatTableDataSource<any>;
  declare displayedColumns: string[];
  @Input()  declare tableColumns: S1CardDataTableColumn[];
  @Input() set tableData(data: any) {
    this.setTableDataSource(data);
  };
  ngOnInit() {    
    this.displayedColumns = this.tableColumns.map(col => col.displayName);
  }
  setTableDataSource(data: any) {
    if (data) {
      this.dataSource = new MatTableDataSource<any>(data);
    }
  }
}
