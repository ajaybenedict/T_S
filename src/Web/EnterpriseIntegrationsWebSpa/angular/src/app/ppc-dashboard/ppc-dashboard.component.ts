import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { UserApiService } from '../core/services/user-api.service';
import { DataState } from '../core/services/data-state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ppc-dashboard',
  templateUrl: './ppc-dashboard.component.html',
})
export class PpcDashboardComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  currentPageIndex = 0;
  today = new Date();
  fromDate: any;
  toDate: any;
  dashboardObj: any;
  ppcDashboardData = [];
  collection: any[] | undefined;
  showProgressBar = false;
  orderFromDate: any;
  orderToDate: any;
  sortOrder = 'DESC';
  orderByColumn = 1;
  aiMessagesOverview: any;

  declare dashboardErrorFlagSubs: Subscription;

  constructor(private datePipe: DatePipe, private titleService: Title, private userApiService: UserApiService, private dataState: DataState) {
    this.titleService.setTitle('');
    this.titleService.setTitle('StreamOne PPC Dashboard');
    this.fromDate = new Date(this.today);
    this.toDate = new Date(this.today);
    this.fromDate.setDate(this.today.getDate() - 7);
    this.orderFromDate = this.fromDate.toISOString().split('T')[0];
    this.orderToDate = this.toDate.toISOString().split('T')[0];
    this.dashboardObj = {
      DateFilterType: "custom",
      OrderFromDate: this.orderFromDate,
      OrderToDate: this.orderToDate,
      StatusFilter: 1,
      Status: "1,2,3,5,7",
      CountryFilter: 0,
      Country: [],
      CountryValues: [],
      TextSearch: 0,
      SearchText: "",
      PageIndex: this.currentPageIndex,
      PageSize: 10,
      SortOrder: this.sortOrder,
      OrderByColumn: this.orderByColumn
    }
    this.dataState.setDateFilter({
      startDate: this.orderFromDate,
      endDate: this.orderToDate
    });
    this.searchForm = new FormGroup({
      searchValue: new FormControl('', Validators.required),
      FromDate: new FormControl(),
      ToDate: new FormControl(),
      country: new FormControl(),
      filter: new FormControl()
    });
  }

  ngOnInit(): void {
    this.getPPCDashBoardData();
    this.dashboardErrorFlagSubs = this.dataState.hasDashboardAPIError$.subscribe(res => this.showProgressBar = !res);
  }

  getPPCDashBoardData() {
    this.showProgressBar = true;
    this.aiMessagesOverview = null;
    this.userApiService.getPPCDashboardData(this.dashboardObj).subscribe((res: any) => {
      if(res) {
        this.dataState.setHasDashboardAPIError(false);
        this.dataState.setselectedPageNo(this.dashboardObj.PageIndex);
        this.ppcDashboardData = res;
        if (Array.isArray(this.ppcDashboardData)) {
          this.ppcDashboardData = this.formatOrderDates(this.ppcDashboardData);
         // this.getMessagesForAiOverview();
        }
        this.showProgressBar = false;
      }
    })
  }

  getMessagesForAiOverview() {
    this.aiMessagesOverview = [];
    this.aiMessagesOverview.push({
      "role": "system",
      "content": `You are an AI Assistant that provides summarizes, analyzes and provides overview of the JSON data that is prvoided to you. JSON data includes software subscription orders placed by our resellers in the TD Synnex (Distributors) ecommerce platform.
      The orders can be in bulk for the resellers end customers.The orders need to go through a pre order credit check before they are approved for fullfilment.
      Orders can be configured to be auto approved or manual approve from UI as per the backend rules configured at country level. Auto aproved orders are sent to ERP
      for final approval. Manual configured orders based on country rules are show in UI under "Needs Approval" tab for internal staff to review and approve.
      THe decisions to approve are typically based on how large the approval amount is and who the reseller Is. there are also additional fields in JSOn like
      avalable credit and outstanding balance that can be used to make decisions. ie if the reseller has enough credit to place the order based on available credit.
      Even if he does have credit, you may want to summarize and highlight any large amount orders or any anomalies and/or riskst that need a more careful review in the order to help user make a decision.
      The data includes order details like order Key (orderId) order date, Order Value ISO country code
      approvalType- auto or manual.
      Your summary analysis must be always on top.      
      you can use markdown to format your response.
      `
    });

    this.aiMessagesOverview.push({
      "role": "user",
      "content": `Please summarize and analyze the orders provided based on the data and instructions provided to you. Orders Data - ${JSON.stringify(this.ppcDashboardData)}`
      
    });
  }

  formatOrderDates(data: any) {
    if (Array.isArray(this.ppcDashboardData)) {
      this.ppcDashboardData?.forEach((item: any) => {
        if (item.orderDate) {
          const date = new Date(item.orderDate);
          item.orderDate = this.datePipe.transform(date, 'dd MMM, yyyy');
          item.orderTime = this.datePipe.transform(date, 'hh:mm a');
        }

        if (item.updatedOn) {
          const date = new Date(item.updatedOn);
          item.updatedDate = this.datePipe.transform(date, 'dd MMM, yyyy');
          item.updatedTime = this.datePipe.transform(date, 'hh:mm a');
        }
      });
      return data;
    }
  }

  pageChangedFromChild(page: any) {
    this.dashboardObj.PageIndex = page;
    this.currentPageIndex = page;
    this.dataState.sortDataObs().subscribe((res)=>{
      this.dashboardObj.SortOrder = res.sortOrder;
      this.dashboardObj.OrderByColumn = res.sortBy;
    })
    this.getPPCDashBoardData();
  }

  SortingChangedFromChild(sortBy:any) {
    this.dataState.sortDataObs().subscribe((res)=>{
      this.dashboardObj.SortOrder = res.sortOrder;
      this.dashboardObj.OrderByColumn = res.sortBy;
    })
    this.getPPCDashBoardData();
  }

  searchTextValue(searchObj: any) {
    if (searchObj === null) {
      this.dashboardObj = {
        DateFilterType: "custom",
        OrderFromDate: this.orderFromDate,
        OrderToDate: this.orderToDate,
        StatusFilter: 1,
        Status: "1,2,3,5,7",
        CountryFilter: 0,
        Country: [],
        CountryValues: [],
        TextSearch: 0,
        SearchText: "",
        PageIndex: this.currentPageIndex,
        PageSize: 10,
        SortOrder: this.sortOrder,
        OrderByColumn: this.orderByColumn
      }
    }
    else if (searchObj?.filterLink) {
      this.dashboardObj = {
        DateFilterType: "custom",
        OrderFromDate: this.orderFromDate,
        OrderToDate: this.orderToDate,
        StatusFilter: 1,
        Status: searchObj?.currentLink,
        CountryFilter: 0,
        Country: [],
        CountryValues: [],
        TextSearch: 0,
        SearchText: "",
        PageIndex: searchObj?.pageIndex,
        PageSize: 10,
        SortOrder: this.sortOrder,
        OrderByColumn: this.orderByColumn
      }
      this.dataState.setselectedPageNo(searchObj?.pageIndex);
    }
    else {
      this.dashboardObj = {
        DateFilterType: searchObj[0].dateFilterType,
        OrderFromDate: searchObj[0].fromDate,
        OrderToDate: searchObj[0].toDate,
        StatusFilter: 1,
        Status: searchObj[0].selectedLink,
        CountryFilter: searchObj[0].selectedCountries.length > 0 ? 1 : 0,
        Country: searchObj[0].selectedCountries,
        CountryValues: [],
        TextSearch: searchObj[0].searchText ? 1 : 0,
        SearchText: searchObj[0].searchText ? searchObj[0].searchText : '',
        PageIndex: searchObj[0]?.pageIndex === 0 ? searchObj[0].pageIndex : this.currentPageIndex,
        PageSize: 10,
        SortOrder: this.sortOrder,
        OrderByColumn: this.orderByColumn
      }
    }
    this.getPPCDashBoardData();
  }

  ngOnDestroy(): void {
    if(this.dashboardErrorFlagSubs) this.dashboardErrorFlagSubs.unsubscribe();
  }
}
