import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
@Component({
  selector: 'app-ppc-paginator',
  templateUrl: './ppc-paginator.component.html',
  styleUrls: ['./ppc-paginator.component.css']
})
export class PpcPaginatorComponent implements OnInit, OnDestroy {
  
  declare dropdownTitle: number;
  declare startIndex: number;
  declare endIndex: number;
  declare pageSizeOptions: number[];
  declare inputData: PPCPaginatorData;
  declare dataSubs: Subscription;
  
  constructor(
    private ppcPaginatorDataSVC: PpcPaginatorDataService
  ) {}

  ngOnInit(): void { 
    this.dataSubs =  this.ppcPaginatorDataSVC.ppcPaginatorData$.subscribe({
      next: res => {
        if(res) {          
          this.inputData = res;
          this.init();
        }
      }
    });    
  }

  init() {
    this.pageSizeOptions = this.inputData.pageSizeOption ? this.inputData.pageSizeOption : [25, 50, 75, 100];
    this.dropdownTitle = this.inputData.pageSize; // First option to display by default
    this.calculateIndex();
  }

  getItemsPerPage(event: Event) {
    // set dropdown button title
    const ele = (event.target) as HTMLElement;
    this.dropdownTitle = parseInt(ele.innerText);
    // change the _pageSize
    this.inputData.pageSize = parseInt(ele.innerText);
    this.inputData.page = 1;
    this.calculateIndex();
    this.emit(); // For all changes, we will emit the changes
  }

  pageChangeEvent(event: number) {
    this.inputData.page = event;  
    this.calculateIndex();
    this.emit(); // For all changes, we will emit the changes 
  }

  calculateIndex() {        
    this.startIndex = (this.inputData.page - 1) * this.inputData.pageSize + 1;
    this.endIndex = Math.min(this.inputData.pageSize * this.inputData.page, this.inputData.total);    
  }

  emit() {
    this.ppcPaginatorDataSVC.setPPCPageChangeEventData({page: this.inputData.page, pageSize: this.inputData.pageSize});
  }

  ngOnDestroy(): void {
    this.ppcPaginatorDataSVC.setPPCPageChangeEventData(null);
    this.ppcPaginatorDataSVC.setPPCPaginatorData(null);
    if(this.dataSubs) {
      this.dataSubs.unsubscribe();
    }
  }
}
