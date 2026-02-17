import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PPCTableColumnData } from 'src/app/models/ppc-table-column.model';

interface LinkKeyMap {
  urlKey: string;
  columnKey: string;
}

@Component({
  selector: 'app-ppc-data-table',
  templateUrl: './ppc-data-table.component.html',
  styleUrls: ['./ppc-data-table.component.css']
})
export class PpcDataTableComponent implements OnInit {

  // To allow html tags in table data
  htmlColumns = [
    // SKU upload result table column
    'message',
  ];

  // To show links in table data
  columnsWithLink = [
    // SKU upload result table column
    'productId',
  ];

  // Link key in table data
  linkKeyMap: LinkKeyMap[] = [
    // SKU upload result table column
    {
      columnKey: 'productId',
      urlKey: 'productIdUrl',
    },
  ];

  @Input() declare tableColumns: PPCTableColumnData[];
  @Input() isSearchData: boolean = false;
  @Input() isSuccessData: boolean = false;
  @Input() set tableData(data: any) {
    this.setTableDataSource(data);
  }
  @Input() set showLoader(value: boolean) {
    this.setIsLoading(value);
  }

  declare tableDataSource: MatTableDataSource<any>;
  declare displayedColumns: string[];

  isLoading: boolean = false;

  ngOnInit(): void {
    const columnNames = this.tableColumns.map((tableColumn: PPCTableColumnData) => tableColumn.columnName);    
    this.displayedColumns = columnNames;
  }
  setIsLoading(value: boolean) {
    this.isLoading = value;
  }
  getLinkKey(column: string): string {
    const data: LinkKeyMap | undefined = this.linkKeyMap.find(el => el.columnKey === column);    
    if (!data) {
      throw new Error(`No link key found for column: ${column}`);
    }
    return data.urlKey;
  }
  setTableDataSource(data: any) {
    if (data) {
      this.tableDataSource = new MatTableDataSource<any>(data);
    }
  }
  isHtmlColumn(key: string) {
    return this.htmlColumns.includes(key);
  } 
  getNoData() {
    let search = {
      imgSrc: '/assets/Frame.svg',
      title: 'No results found',
      content: 'There are no results for your current search. Adjust search criteria to improve results.'
    };
    let api = {
      imgSrc: '/assets/no_data_undraw.svg',
      title: 'Perfect! No Errors',
      content: 'Everything looks great! Your data is clean.'
    };

    if(!this.isSuccessData) {
      // Error tab
      if(this.isSearchData) {
        return search;
      }else {
        return api;
      }
    } else {
      return search;
    }

  }
}
