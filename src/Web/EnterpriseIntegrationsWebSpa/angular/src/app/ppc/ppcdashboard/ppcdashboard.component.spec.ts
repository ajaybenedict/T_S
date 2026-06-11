import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';

import { BillingTermFilterEnum, ResellerStatusFilterEnum } from 'src/app/models/ppc/ppc-filter.interface';
import { PpcdashboardComponent } from './ppcdashboard.component';

describe('PpcdashboardComponent - Billing Term & Reseller Status', () => {
  let component: PpcdashboardComponent;
  let fixture: ComponentFixture<PpcdashboardComponent>;
  let dashboardDataSvcMock: any;
  let dashboardApiSvcMock: any;
  let paginatorSvcMock: any;

  beforeEach(async () => {
    dashboardDataSvcMock = {
      orderResponseData$: of(null),
      orderAPIInProgress$: of(false),
      activeTabId$: of(0),
      setCountryRegionData: jasmine.createSpy('setCountryRegionData'),
      buildOrderRequestDataFromQuery: jasmine.createSpy('buildOrderRequestDataFromQuery').and.returnValue({
        ApprovalType: [],
        Country: [],
        AmountMin: 0,
        AmountMax: 0,
        SearchText: '',
        PageIndex: 0,
        PageSize: 10,
        MultiYearContractFilter: 1,
        MultiYearContract: true,
        OnHold: true,
        OnHoldFilter: 1,
        Discontinued: false,
        DiscontinuedFilter: 0,
      }),
      setOrderRequestData: jasmine.createSpy('setOrderRequestData'),
      clearQueryParamsFromUrl: jasmine.createSpy('clearQueryParamsFromUrl'),
      setOrderResponseData: jasmine.createSpy('setOrderResponseData'),
      setDefaultDaterangeHeader: jasmine.createSpy('setDefaultDaterangeHeader'),
      setSelectedFilterType: jasmine.createSpy('setSelectedFilterType'),
      setSidepanelFilterCount: jasmine.createSpy('setSidepanelFilterCount'),
      setSelectedApprovalType: jasmine.createSpy('setSelectedApprovalType'),
      setSelectedBillingTerm: jasmine.createSpy('setSelectedBillingTerm'),
      setSelectedResellerStatus: jasmine.createSpy('setSelectedResellerStatus'),
      setSelectedCountry: jasmine.createSpy('setSelectedCountry'),
      setSelectedOrderValue: jasmine.createSpy('setSelectedOrderValue'),
      getOrderId: jasmine.createSpy('getOrderId').and.returnValue(''),
      setOrderAPIInProgress: jasmine.createSpy('setOrderAPIInProgress'),
      getOrderRequestData: jasmine.createSpy('getOrderRequestData').and.returnValue({
        PageIndex: 0,
        PageSize: 10,
      }),
    };
    dashboardApiSvcMock = {
      getCountriesWithRegion: jasmine.createSpy('getCountriesWithRegion').and.returnValue(of([])),
      getOrders: jasmine.createSpy('getOrders').and.returnValue(of([])),
    };
    paginatorSvcMock = {
      ppcPageChangeEventData$: of(null),
      setPPCPaginatorData: jasmine.createSpy('setPPCPaginatorData'),
    };

    await TestBed.configureTestingModule({
      declarations: [ PpcdashboardComponent ],
      providers: [
        { provide: PPCDashboardDataService, useValue: dashboardDataSvcMock },
        { provide: PPCDashboardAPIService, useValue: dashboardApiSvcMock },
        { provide: PpcPaginatorDataService, useValue: paginatorSvcMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcdashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should pass applicationId to ai-summary custom element', () => {
    const host = document.createElement('div');
    (component as any)._aiSummaryContainer = new ElementRef(host);
    component.aiSummaryJsondata = '{"key":"value"}';

    const renderer = (component as any).renderer;
    const createdElement = renderer.createElement('ai-summary') as HTMLElement & {
      assistantId?: number;
      applicationId?: number;
      jsonData?: string;
    };
    spyOn(renderer, 'createElement').and.returnValue(createdElement);
    spyOn(renderer, 'appendChild').and.callThrough();

    (component as any).createAISummaryElement();

    expect(createdElement.assistantId).toBe(component.summaryAssistantId);
    expect(createdElement.applicationId).toBe(component.summaryApplicationId);
    expect(createdElement.jsonData).toBe('{"key":"value"}');
    expect(renderer.appendChild).toHaveBeenCalled();
  });

  it('should generate summary payload when AI panel is opened', () => {
    component.activeTabId = 1;
    component.orderResponseData = [{ orderKey: 'ORDER-99' } as any];
    component.showAISummary = false;

    component.toggleAISummary();

    expect(component.showAISummary).toBeTrue();
    expect(component.aiSummaryJsondata).toContain('Approved');
    expect(component.aiSummaryJsondata).toContain('ORDER-99');
  });

  describe('Billing Term Restoration', () => {
    it('should restore billing term state from request payload', () => {
      fixture.detectChanges();

      // Check that filter count reflects billing term (MultiYearContractFilter=1)
      expect(dashboardDataSvcMock.setSidepanelFilterCount).toHaveBeenCalledWith(
        jasmine.objectContaining({ BillingTerm: 1 })
      );

      // Check that billing term data is restored
      expect(dashboardDataSvcMock.setSelectedBillingTerm).toHaveBeenCalledWith(
        jasmine.arrayContaining([
          jasmine.objectContaining({ key: BillingTermFilterEnum.MultiYear, checked: true }),
          jasmine.objectContaining({ key: BillingTermFilterEnum.Standard, checked: false }),
        ])
      );
    });

    it('should restore Multi-Year as selected billing term', () => {
      fixture.detectChanges();

      expect(dashboardDataSvcMock.setSelectedBillingTerm).toHaveBeenCalled();
      const callArgs = dashboardDataSvcMock.setSelectedBillingTerm.calls.mostRecent().args[0];
      const multiYear = callArgs.find((item: any) => item.key === BillingTermFilterEnum.MultiYear);
      expect(multiYear.checked).toBeTrue();
    });
  });

  describe('Reseller Status Restoration', () => {
    it('should restore reseller status state from request payload', () => {
      fixture.detectChanges();

      // Check that filter count reflects reseller status selections (OnHoldFilter=1, DiscontinuedFilter=0)
      expect(dashboardDataSvcMock.setSidepanelFilterCount).toHaveBeenCalledWith(
        jasmine.objectContaining({ ResellerStatus: 1 })
      );

      // Check that reseller status data is restored
      expect(dashboardDataSvcMock.setSelectedResellerStatus).toHaveBeenCalledWith(
        jasmine.arrayContaining([
          jasmine.objectContaining({ key: ResellerStatusFilterEnum.OnHold, checked: true }),
          jasmine.objectContaining({ key: ResellerStatusFilterEnum.Discontinued, checked: false }),
        ])
      );
    });

    it('should correctly count multiple reseller status selections', () => {
      const mockRequest = {
        ApprovalType: [],
        Country: [],
        AmountMin: 0,
        AmountMax: 0,
        SearchText: '',
        PageIndex: 0,
        PageSize: 10,
        MultiYearContractFilter: 0,
        MultiYearContract: false,
        OnHold: true,
        OnHoldFilter: 1,
        Discontinued: true,
        DiscontinuedFilter: 1,
      };
      dashboardDataSvcMock.buildOrderRequestDataFromQuery.and.returnValue(mockRequest);

      fixture.detectChanges();

      // Both OnHold and Discontinued are selected, so count should be 2
      expect(dashboardDataSvcMock.setSidepanelFilterCount).toHaveBeenCalledWith(
        jasmine.objectContaining({ ResellerStatus: 2 })
      );
    });
  });

  describe('Independent Filter Management', () => {
    it('should manage billing term and reseller status independently', () => {
      fixture.detectChanges();

      // Verify both setters are called
      expect(dashboardDataSvcMock.setSelectedBillingTerm).toHaveBeenCalled();
      expect(dashboardDataSvcMock.setSelectedResellerStatus).toHaveBeenCalled();
    });

    it('should calculate correct filter counts separately', () => {
      fixture.detectChanges();

      // Verify filter count call includes both BillingTerm and ResellerStatus
      expect(dashboardDataSvcMock.setSidepanelFilterCount).toHaveBeenCalledWith(
        jasmine.objectContaining({
          BillingTerm: jasmine.any(Number),
          ResellerStatus: jasmine.any(Number),
        })
      );
    });
  });
});
