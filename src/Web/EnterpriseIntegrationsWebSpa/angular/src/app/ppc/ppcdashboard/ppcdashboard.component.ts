import { SidePanelHelper } from './../ppc-filter-sidepanel/side-panel.helper';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { C3_AI_SUMMARY_ASSISTANT_ID, PPC_DASHBOARD_PAGE_SIZE } from 'src/app/core/constants/constants';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { PPCPageChangeEventData, PPCPaginatorData } from 'src/app/models/ppc-paginator.model';
import { OrderRequest, OrderResponse } from 'src/app/models/ppc/order-api.interface';
import { S1GroupCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';
import { S1SearchBar } from 'src/app/models/s1/s1-search-bar.interface';

@Component({
  selector: 'app-ppcdashboard',
  templateUrl: './ppcdashboard.component.html',
  styleUrls: ['./ppcdashboard.component.css']
})
export class PpcdashboardComponent implements OnInit, OnDestroy {

  declare orderRequestData: OrderRequest;
  declare orderResponseData: OrderResponse[] | null;
  declare orderResponseSubs: Subscription;
  declare pageChangeEventSubs: Subscription;
  declare orderAPIProgressSubs: Subscription;
  declare paginatorData: PPCPaginatorData;
  declare searchBarData: S1SearchBar;
  declare countryRegionCheckbox: S1GroupCheckbox[];

  pageSize: number = PPC_DASHBOARD_PAGE_SIZE;
  orderAPIInProgress: boolean = false;
  isPaginatorVisible: boolean = false;
  showAISummary = false;
  isAISummaryMinimized = false;
  summaryAssistantId = C3_AI_SUMMARY_ASSISTANT_ID;
  aiSummaryJsondata!:string;
  activeTabId!: number;
  activeTabIdSubs!: Subscription;

  private readonly destroy$ = new Subject<void>;

  @ViewChild('aiSummary', { read: ElementRef }) private set aiSummaryContainerSetter(el: ElementRef | undefined) {
    // this will be called when the template creates/destroys the host element
    this._aiSummaryContainer = el ?? undefined;
    if (this._aiSummaryContainer && this.showAISummary) {
      // create element once host is available
      this.createAISummaryElement();
    } else if (!this._aiSummaryContainer) {
      // host removed (ngIf false) -> cleanup
      this.destroyAiSummaryElement();
    }
  }
  private _aiSummaryContainer?: ElementRef;

   private aiSummaryEl?: HTMLElement & { jsonData?: string; assistantId?: number };
   private panelClosedHandlerRef?: EventListener;
   private panelMinimizedHandlerRef?: EventListener;

  constructor(
    private readonly paginatorSVC: PpcPaginatorDataService,
    private readonly dashboardApiSVC: PPCDashboardAPIService,
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly renderer: Renderer2,
    private readonly zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.dashboardDataSVC.orderResponseData$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (res) => {
        this.orderResponseData = res;
        this.initPaginator();
        this.initSummaryData();
      }
    });
    this.paginatorSVC.ppcPageChangeEventData$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if(res) {
          this.pageChangeHandler(res);
        }
      }
    });
    this.dashboardDataSVC.orderAPIInProgress$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        this.orderAPIInProgress = res;
        // when AI summary panel is open && orderAPI starts, close the panel.
        if(this.showAISummary && this.orderAPIInProgress) this.showAISummary = false;
      },
    });
    this.dashboardApiSVC.getCountriesWithRegion().subscribe({
      next: res => {
        if(res?.length) {
          this.countryRegionCheckbox = SidePanelHelper.mapCountryApiToGroupCheckbox(res);
          this.dashboardDataSVC.setCountryRegionData(res);
        }
      }
    });
    this.dashboardDataSVC.activeTabId$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => this.activeTabId = res
    });
    this.initTasks();
    this.initSearchBar();
  }

  private initializeOrderRequest(): OrderRequest {
    const request = this.dashboardDataSVC.buildOrderRequestDataFromQuery();
  
    this.orderRequestData = request;
    this.dashboardDataSVC.setOrderRequestData(request);
    this.getOrderDetails(request);
    this.dashboardDataSVC.clearQueryParamsFromUrl();
    return request;
  }

  private resetDashboardState(): void {
    this.dashboardDataSVC.setOrderResponseData(null);
    this.dashboardDataSVC.setDefaultDaterangeHeader();
    this.dashboardDataSVC.setSelectedFilterType('');
  }

  private syncSidePanelState(orderRequest: OrderRequest): void {
    this.updateSidepanelFilterCount(orderRequest);
    this.updateApprovalType(orderRequest);
    this.updateCountrySelection(orderRequest);
    this.updateOrderValue(orderRequest);
  }
  
  private updateSidepanelFilterCount(orderRequest: OrderRequest): void {
    this.dashboardDataSVC.setSidepanelFilterCount({
      ApprovalType: orderRequest.ApprovalType.length,
      Country: orderRequest.Country.length,
      OrderValue: this.hasOrderValueFilter(orderRequest) ? 1 : 0
    });
  }
  
  private hasOrderValueFilter(orderRequest: OrderRequest): boolean {
    return orderRequest.AmountMax > 0;
  }

  private updateApprovalType(orderRequest: OrderRequest): void {
    const approvalData = SidePanelHelper.getSelectedApprovalTypeData(orderRequest.ApprovalType);
    this.dashboardDataSVC.setSelectedApprovalType(approvalData);
  }

  private updateCountrySelection(orderRequest: OrderRequest): void {
    const countries = SidePanelHelper.applySelectedCountries(this.countryRegionCheckbox,orderRequest.Country);
    this.dashboardDataSVC.setSelectedCountry(countries);
  }

  private updateOrderValue(orderRequest: OrderRequest): void {
    const value = SidePanelHelper.getMinMaxData(orderRequest.AmountMin, orderRequest.AmountMax);
    this.dashboardDataSVC.setSelectedOrderValue(value);
  } 
  
  initTasks(): void {
    const orderRequest = this.initializeOrderRequest();  
    this.resetDashboardState();
    this.syncSidePanelState(orderRequest);
  }
  
  initSearchBar() {
    this.searchBarData = {
      placeHolder: 'Search for Order Number',
      width: '400px',
      searchText: this.dashboardDataSVC.getOrderId() ?? this.orderRequestData.SearchText,
    };
  }

  initSummaryData() {
    let activeTabName: string;

    switch(this.activeTabId) {
      case 1:
        activeTabName = 'Approved';
        break;
      case 2:
        activeTabName = 'Declined';
        break;
      default:
        activeTabName = 'Needs Approval';
    }
    const msg = `This is **${activeTabName}**: ${JSON.stringify(this.orderResponseData)}}`;
    this.aiSummaryJsondata = msg;
  }

  searchEventHandler(data: string) {
    let dataToSend: Partial<OrderRequest>;
    if(data == '') {
      dataToSend = {SearchText: '', TextSearch: 0};
    } else {
      dataToSend = {SearchText: data, TextSearch: 1};
    }
    // reset page size & index in order to get proper result.
    dataToSend = {...dataToSend, PageIndex: 0, PageSize: PPC_DASHBOARD_PAGE_SIZE};
    this.dashboardDataSVC.setOrderRequestData(dataToSend);
    const orderReqData = this.dashboardDataSVC.getOrderRequestData();
    this.getOrderDetails(orderReqData);
  }

  getOrderDetails(data: OrderRequest) {
    this.dashboardDataSVC.setOrderAPIInProgress(true);
    this.dashboardApiSVC.getOrders(data).subscribe({
      next: (res) => {
        this.orderResponseData = res;
        this.dashboardDataSVC.setOrderResponseData(res);
        this.dashboardDataSVC.setOrderAPIInProgress(false);
      },
    });
  }

  initPaginator() {
    if(this.orderResponseData?.length) {
      this.orderRequestData = this.dashboardDataSVC.getOrderRequestData();
      this.paginatorData = {
        page: Math.floor(this.orderRequestData.PageIndex / this.pageSize) + 1,
        pageSize: this.orderRequestData.PageSize,
        total: this.orderResponseData[0].totalRows,
        pageSizeOption: [10, 25, 50, 100],
      };
      this.paginatorSVC.setPPCPaginatorData(this.paginatorData);
      this.isPaginatorVisible = true;
    } else {
      this.isPaginatorVisible = false;
    }
  }

  pageChangeHandler(event: PPCPageChangeEventData) {
    const orderReqData = this.dashboardDataSVC.getOrderRequestData();
    let data: Partial<OrderRequest>;
    if(orderReqData.PageSize != event.pageSize) {
      // there is a page size change. default to 1st page
      data = {
        PageIndex: 0,
        PageSize: event.pageSize,
      };
    } else {
      data = {
        PageIndex: (event.page - 1) * event.pageSize,
        PageSize: event.pageSize
      };
    }
    this.pageSize = event.pageSize;
    const dataToSend = {...orderReqData, ...data};
    this.dashboardDataSVC.setOrderRequestData(dataToSend);
    this.getOrderDetails(dataToSend);
  }

  private createAISummaryElement() {
     // avoid creating twice
    if (!this._aiSummaryContainer) return;
    if (this.aiSummaryEl) return;

    // create element
    const el = this.renderer.createElement('ai-summary') as HTMLElement & {
      jsonData?: string;
      assistantId?: number;
    };

    // set properties (preferred over attributes)
    // If aiSummaryJsondata might be an object, set property directly.
    el['jsonData'] = this.aiSummaryJsondata;
    el['assistantId'] = this.summaryAssistantId;

    // Or set attributes if the web component expects attributes (strings)
    // this.renderer.setAttribute(el, 'assistantId', String(this.summaryAssistantId));
    // this.renderer.setAttribute(el, 'jsonData', JSON.stringify(this.aiSummaryJsondata));

    // Wire up event listeners. Use NgZone.run to re-enter Angular zone.
    this.panelClosedHandlerRef = (ev: Event) => {
      this.zone.run(() => this.panelClosedHandler());
    };
    this.panelMinimizedHandlerRef = (ev: Event) => {
      this.zone.run(() => this.panelMinimizedHandler());
    };

    el.addEventListener('panelClosed', this.panelClosedHandlerRef);
    el.addEventListener('panelMinimized', this.panelMinimizedHandlerRef);

    // append to container
    this.renderer.appendChild(this._aiSummaryContainer.nativeElement, el);

    this.aiSummaryEl = el;

  }

  /** Remove element and listeners */
  private destroyAiSummaryElement() {
    if (!this.aiSummaryEl) return;
    if (this.panelClosedHandlerRef) {
      this.aiSummaryEl.removeEventListener('panelClosed', this.panelClosedHandlerRef);
      this.panelClosedHandlerRef = undefined;
    }
    if (this.panelMinimizedHandlerRef) {
      this.aiSummaryEl.removeEventListener('panelMinimized', this.panelMinimizedHandlerRef);
      this.panelMinimizedHandlerRef = undefined;
    }
    if(this._aiSummaryContainer) this.renderer.removeChild(this._aiSummaryContainer.nativeElement, this.aiSummaryEl);
    this.aiSummaryEl = undefined;
  }

  toggleAISummary() {
    this.showAISummary = !this.showAISummary;
    this.isAISummaryMinimized = false; // make it open ins expanded state always.
  }

  panelClosedHandler() {
    this.toggleAISummary();
  }

  toggleAISummaryPanelState() {
    this.isAISummaryMinimized = !this.isAISummaryMinimized;
  }

  panelMinimizedHandler() {
    this.toggleAISummaryPanelState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyAiSummaryElement();
  }
}
