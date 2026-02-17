import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { BaseDisplayComponent } from './base-display.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Configuration } from '../models/display-entity';

@Component({
  selector: 'display-table',
  templateUrl: './display-table.component.html'
})
export class DisplayTableComponent extends BaseDisplayComponent {
  displayedColumns: string[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  dataSourceTable = new MatTableDataSource<any>;
  pageTokens: string[] = [''];
  constructor() {

    super();

  }
  ngOnInit() {
    this.dataSourceTable = new MatTableDataSource(this.dataSource);

    // Ensure that configuration and columns are defined before trying to access them
    if (this.configuration && this.configuration.columns) {
      this.displayedColumns = this.configuration.columns.map(item => item.id);
    }

    if (this.dataSourceTable && this.dataSourceTable.data.length > 0) {
      // Additional logic for when dataSourceTable has data
    }
  }

  ngAfterViewInit() {
    if (this.dataSourceTable && this.paginator)
    this.dataSourceTable.paginator = this.paginator;
    //this.dataSourceTable.sort = this.sort;
  }

  flattenJSON(data: any, parentKey = '', res: any = {}) {
    for (let key in data) {
      const propName = parentKey ? parentKey + '_' + key : key;
      if (typeof data[key] === 'object') {
        this.flattenJSON(data[key], propName, res);
      } else {
        res[propName] = data[key];
      }
    }
    return res;
  }

  loadNextPage() {
    if (this.pagination) {
      const nextPageToken = this.pagination.nextPageToken;
      if (nextPageToken) {
        // Before loading the next page, save the current nextPageToken as the last known token
        if (this.pageTokens[this.pageTokens.length - 1] !== nextPageToken) {
          this.pageTokens.push(nextPageToken);
        }
        this.loadPage(nextPageToken);
      }
    }

  }

  loadPreviousPage() {
    // If there's more than one token, remove the last one and load the page for the new last token
    if (this.pageTokens.length > 1) {
      this.pageTokens.pop(); // Remove the current page's token
      const previousPageToken = this.pageTokens[this.pageTokens.length - 1];
      this.loadPage(previousPageToken);
    }
  }

  private loadPage(pageToken: string = '') {
    if (this.apiDataService) {
      this.apiDataService.getApiData(this.function, this.arguments, pageToken).subscribe(response => {
        this.dataSourceTable.data = response.data;
        // Update pagination with the new nextPageToken
        this.pagination = {
          nextPageToken: response.pagination?.nextPageToken || ''
        };
      });
    }
  }

}
