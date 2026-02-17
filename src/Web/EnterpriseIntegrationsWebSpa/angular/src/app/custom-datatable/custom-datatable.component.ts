import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TAB_VALUE_APPROVED, TAB_VALUE_NEEDSAPPROVAL } from '../core/constants/constants';
import { UserApiService } from '../core/services/user-api.service';
import { DataState } from '../core/services/data-state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-datatable',
  templateUrl: './custom-datatable.component.html',
  styleUrls: ['./custom-datatable.component.css']
})

export class CustomDatatableComponent implements OnInit, OnDestroy {
  @Input() datatable: any;
  @Input() showProgressBarInput = true;
  @Output() pageChangedFromChild = new EventEmitter<any>();
  @Output() SortingChangedFromChild = new EventEmitter<any>();
  @Output() showProgressBarChild = new EventEmitter<any>();
  dashboardObjfromChild: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 10;
  orderLinkSelect: any;
  orderType: boolean = true;
  approvalType: boolean = false;
  declineType: boolean = false;
  sortByColumn = 1;
  sortOrder = 'DESC';

  declare dashboardAPIErrorSubs: Subscription;
  dashboardAPIErrorFlag: boolean = false;

  constructor(private toastr: ToastrService, private userApiService: UserApiService, private dataState: DataState) { }

  ngOnInit(): void {
    this.dashboardAPIErrorSubs = this.dataState.hasDashboardAPIError$.subscribe(res => this.dashboardAPIErrorFlag = res);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataState.orderTypeSettingObservable().subscribe(res => this.orderLinkSelect = res);
    if (this.orderLinkSelect == TAB_VALUE_NEEDSAPPROVAL) {
      this.orderType = true;
      this.approvalType = false;
      this.declineType = false;
    }
    else if (this.orderLinkSelect == TAB_VALUE_APPROVED) {
      this.orderType = false;
      this.approvalType = true;
      this.declineType = false;
    }
    else {
      this.orderType = false;
      this.approvalType = false;
      this.declineType = true;
    }

    if (changes['datatable']) {
      this.count = this.datatable[0]?.totalRows;
    }
    this.dataState.selectedPageNoObs().subscribe(val => {
      if (val == 0) {
        this.page = val + 1;
      }
    })
  }

  showSuccess(orderkey: any, msg: any) {
    this.toastr.show(msg, "", {
      tapToDismiss: false,
      toastClass: "ngx-toastr",
      positionClass: 'toast-bottom-center'
    });
  }

  setDeclineResponse(order: any, orderStatus?: any) {
    this.showProgressBarInput = true;
    let orderStatusObj = {
      OrderStatus: orderStatus,
      OrderKey: order.orderKey,
      UpdatedBy: ""
    };

    if (orderStatus === 2) {
      this.userApiService.setDeclineResponse(orderStatusObj).subscribe((res: any) => {
        if (res == true) {
          this.showSuccess(orderStatusObj.OrderKey, `Order ${orderStatusObj.OrderKey} has moved to Needs Approval`);
        }
        else if (res.orderKey != null) {
          this.showSuccess(orderStatusObj.OrderKey, res.orderKey);
        }
        else {
          this.showSuccess(orderStatusObj.OrderKey, res);
        }
        this.showProgressBarInput = false;
        this.getPPCDashboardData();
      },
        (err) => {
          console.log(err);
          this.showSuccess(orderStatusObj.OrderKey, err.status + " " + err.statusText);
        }
      )
    }
    else {
      this.userApiService.setDeclineResponse(orderStatusObj).subscribe((res: any) => {
        if (res == true) {
          this.showSuccess(orderStatusObj.OrderKey, `Order ${orderStatusObj.OrderKey} has been declined`);
        }
        else if (res.orderKey != null) {
          this.showSuccess(orderStatusObj.OrderKey, res.orderKey);
        }
        else {
          this.showSuccess(orderStatusObj.OrderKey, res);
        }
        this.showProgressBarInput = false;
        this.getPPCDashboardData();
      },
        (err) => {
          console.log(err);
          this.showSuccess(orderStatusObj.OrderKey, err.status + " " + err.statusText);
        }
      )
    }
  }

  setAppoveResponse(order: any, orderStatus?: any) {
    this.showProgressBarInput = true;
    let orderStatusObj = {
      OrderStatus: orderStatus,
      OrderKey: order.orderKey,
      UpdatedBy: ""
    };

    this.userApiService.setApproveResponse(orderStatusObj).subscribe((res: any) => {
      if (res == true) {
        this.showSuccess(orderStatusObj.OrderKey, `Order ${orderStatusObj.OrderKey} has been approved`);
      }
      else if (res.orderKey != null) {
        this.showSuccess(orderStatusObj.OrderKey, res.orderKey);
      }
      else {
        this.showSuccess(orderStatusObj.OrderKey, res);
      }
      this.showProgressBarInput = false;
      this.getPPCDashboardData();      
    },
      (err) => {
        console.log(err);
        this.showSuccess(orderStatusObj.OrderKey, err.status + " " + err.statusText);
      }
    )
  }

  upperBound(): number {
    const upper = this.page * this.tableSize;
    return upper > this.count ? this.count : upper;
  }

  onTableDataChange(event: any) {
    this.page = event;
    let pageIndex = (this.page - 1) * 10;
    this.dataState.setselectedPageNo(pageIndex);
    this.pageChangedFromChild.emit(pageIndex);
  }

  getPPCDashboardData() {
    let startDate;
    let endDate;
    let pageIndex;
    let selectedData = {
      currentLink: undefined,
      dateFilterType: undefined,
      searchedText: undefined,
      selectedCountries: []
    };
    this.dataState.dateFilterObs().subscribe((res: any) => {
      startDate = res.startDate;
      endDate = res.endDate;
    });
    this.dataState.selectedPageNoObs().subscribe((res: any) => {
      pageIndex = res;
    });
    this.dataState.selectedFilterDataObs().subscribe((res: any) => {
      selectedData = {
        currentLink: res.currentLink,
        dateFilterType: res.dateFilterType,
        searchedText: res.searchedText,
        selectedCountries: res.selectedCountries
      }
    });

    let dashboardObj = {
      DateFilterType: selectedData?.dateFilterType ? selectedData?.dateFilterType : "custom",
      OrderFromDate: startDate,
      OrderToDate: endDate,
      StatusFilter: 1,
      Status: selectedData?.currentLink ? selectedData?.currentLink : "1,2,3,5,7",
      CountryFilter: selectedData?.selectedCountries?.length > 0 ? 1 : 0,
      Country: selectedData?.selectedCountries ? selectedData?.selectedCountries : [],
      CountryValues: [],
      TextSearch: selectedData?.searchedText ? 1 : 0,
      SearchText: selectedData?.searchedText ? selectedData?.searchedText : "",
      PageIndex: pageIndex,
      PageSize: 10,
      SortOrder: this.sortOrder,
      OrderByColumn: this.sortByColumn
    }
    this.userApiService.getPPCDashboardData(dashboardObj).subscribe(res => this.datatable = res);
  }

  sortColumns(sortBy: number) {
    this.sortByColumn = sortBy;
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.dataState.setsortData({ sortOrder: this.sortOrder, sortBy: sortBy });
    this.SortingChangedFromChild.emit(sortBy);
  }

  toggleImg(event: Event) {
    const imgEle = event.target as HTMLImageElement;
    const mouseAction = event.type;
    const action = imgEle.id.includes('approve') ? 'approve' : 'decline';

    type ActionType = 'approve' | 'decline';
    type MouseActionType = 'mousedown' | 'mouseup';

    const getImageSrc = (action: ActionType, mouseAction: MouseActionType): string => {
      const actions: Record<ActionType, Record<MouseActionType, string>> = {
        approve: {
          mousedown: '/assets/approve_pressed.svg',
          mouseup: '/assets/Approve.svg',
        },
        decline: {
          mousedown: '/assets/decline_pressed.svg',
          mouseup: '/assets/Decline.svg',
        },
      };         
      return actions[action]?.[mouseAction];
    };
    
    imgEle.src = getImageSrc(action as ActionType, mouseAction as MouseActionType);
  }

  ngOnDestroy(): void {
    if(this.dashboardAPIErrorSubs) this.dashboardAPIErrorSubs.unsubscribe();
  }
}
