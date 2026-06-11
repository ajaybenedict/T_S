import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DataState } from 'src/app/core/services/data-state';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { BillingTermFilterEnum, ResellerStatusFilterEnum } from 'src/app/models/ppc/ppc-filter.interface';

import { PpcFilterSidepanelComponent } from './ppc-filter-sidepanel.component';
import { SidePanelHelper } from './side-panel.helper';

describe('PpcFilterSidepanelComponent - Billing Term & Reseller Status', () => {
  let component: PpcFilterSidepanelComponent;
  let fixture: ComponentFixture<PpcFilterSidepanelComponent>;
  let dashboardDataSvcMock: any;
  let dashboardApiSvcMock: any;
  let dataStateMock: any;

  beforeEach(async () => {
    dashboardDataSvcMock = {
      countryRegionData$: of([]),
      selectedOrderValue$: of(null),
      selectedApprovalType$: of(null),
      selectedCountry$: of([]),
      selectedBillingTerm$: of(null),
      selectedResellerStatus$: of(null),
      sidepanelFilterCount$: of({ ApprovalType: 0, Country: 0, OrderValue: 0, BillingTerm: 0, ResellerStatus: 0 }),
      getSelectedFilterType: jasmine.createSpy('getSelectedFilterType').and.returnValue(''),
      getApprovalTypes: jasmine.createSpy('getApprovalTypes').and.returnValue([]),
      getOrderRequestData: jasmine.createSpy('getOrderRequestData').and.returnValue({
        ApprovalType: [],
        Country: [],
        AmountMin: 0,
        AmountMax: 0,
        OnHold: false,
        OnHoldFilter: 0,
        Discontinued: false,
        DiscontinuedFilter: 0,
        MultiYearContractFilter: 0,
        MultiYearContract: false,
      }),
      setSelectedApprovalType: jasmine.createSpy('setSelectedApprovalType'),
      setSelectedCountry: jasmine.createSpy('setSelectedCountry'),
      setSelectedBillingTerm: jasmine.createSpy('setSelectedBillingTerm'),
      setSelectedResellerStatus: jasmine.createSpy('setSelectedResellerStatus'),
      setSelectedOrderValue: jasmine.createSpy('setSelectedOrderValue'),
      setSidepanelFilterCount: jasmine.createSpy('setSidepanelFilterCount'),
      setOrderRequestData: jasmine.createSpy('setOrderRequestData'),
      setOrderAPIInProgress: jasmine.createSpy('setOrderAPIInProgress'),
      setOrderResponseData: jasmine.createSpy('setOrderResponseData'),
      setSelectedFilterType: jasmine.createSpy('setSelectedFilterType'),
    };
    dashboardApiSvcMock = {
      getOrders: jasmine.createSpy('getOrders').and.returnValue(of([])),
    };
    dataStateMock = {
      setPPCSidepanelStatus: jasmine.createSpy('setPPCSidepanelStatus'),
    };

    await TestBed.configureTestingModule({
      declarations: [ PpcFilterSidepanelComponent ],
      providers: [
        { provide: PPCDashboardDataService, useValue: dashboardDataSvcMock },
        { provide: PPCDashboardAPIService, useValue: dashboardApiSvcMock },
        { provide: DataState, useValue: dataStateMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcFilterSidepanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Billing Term Handling', () => {
    it('should initialize billing term checkbox data', () => {
      expect(component.billingTermCheckbox).toBeDefined();
      expect(component.billingTermCheckbox.length).toBe(2);
    });

    it('should keep standard and multi-year mutually exclusive', () => {
      component.billingTermCheckbox = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.Standard,
      ]);

      component.billingTermEventHandler(
        SidePanelHelper.getSelectedBillingTermData([
          BillingTermFilterEnum.Standard,
          BillingTermFilterEnum.MultiYear,
        ])
      );

      expect(component.billingTermCheckbox.find(item => item.key === BillingTermFilterEnum.Standard)?.checked).toBeFalse();
      expect(component.billingTermCheckbox.find(item => item.key === BillingTermFilterEnum.MultiYear)?.checked).toBeTrue();
    });

    it('should update filter count when billing term is selected', () => {
      component.billingTermCheckbox = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.MultiYear,
      ]);

      component.billingTermEventHandler(component.billingTermCheckbox);

      expect(component.filterCount.BillingTerm).toBe(1);
    });
  });

  describe('Reseller Status Handling', () => {
    it('should initialize reseller status checkbox data', () => {
      expect(component.resellerStatusCheckbox).toBeDefined();
      expect(component.resellerStatusCheckbox.length).toBe(2);
    });

    it('should allow independent selection of On Hold and Discontinued', () => {
      component.resellerStatusCheckbox = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
        ResellerStatusFilterEnum.Discontinued,
      ]);

      component.resellerStatusEventHandler(component.resellerStatusCheckbox);

      const onHold = component.resellerStatusCheckbox.find(item => item.key === ResellerStatusFilterEnum.OnHold);
      const discontinued = component.resellerStatusCheckbox.find(item => item.key === ResellerStatusFilterEnum.Discontinued);

      expect(onHold?.checked).toBeTrue();
      expect(discontinued?.checked).toBeTrue();
    });

    it('should allow selection of only On Hold', () => {
      component.resellerStatusCheckbox = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
      ]);

      component.resellerStatusEventHandler(component.resellerStatusCheckbox);

      const onHold = component.resellerStatusCheckbox.find(item => item.key === ResellerStatusFilterEnum.OnHold);
      const discontinued = component.resellerStatusCheckbox.find(item => item.key === ResellerStatusFilterEnum.Discontinued);

      expect(onHold?.checked).toBeTrue();
      expect(discontinued?.checked).toBeFalse();
    });

    it('should update filter count for reseller status selections', () => {
      component.resellerStatusCheckbox = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
        ResellerStatusFilterEnum.Discontinued,
      ]);

      component.resellerStatusEventHandler(component.resellerStatusCheckbox);

      expect(component.filterCount.ResellerStatus).toBe(2);
    });
  });

  describe('Filter Application', () => {
    it('should send billing term filters in the API payload', () => {
      component.countryRegionCheckbox = [];
      component.approvalTypeCheckbox = [];
      component.billingTermCheckbox = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.MultiYear,
      ]);
      component.resellerStatusCheckbox = [];
      component.orderValueData = { ...component.orderValueData, min: 0, max: 0 };

      component.applyFilter();

      expect(dashboardDataSvcMock.setSelectedBillingTerm).toHaveBeenCalled();
      expect(dashboardApiSvcMock.getOrders).toHaveBeenCalledWith(
        jasmine.objectContaining({
          MultiYearContractFilter: 1,
          MultiYearContract: true,
        })
      );
    });

    it('should send reseller status filters in the API payload', () => {
      component.countryRegionCheckbox = [];
      component.approvalTypeCheckbox = [];
      component.billingTermCheckbox = [];
      component.resellerStatusCheckbox = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
        ResellerStatusFilterEnum.Discontinued,
      ]);
      component.orderValueData = { ...component.orderValueData, min: 0, max: 0 };

      component.applyFilter();

      expect(dashboardDataSvcMock.setSelectedResellerStatus).toHaveBeenCalled();
      expect(dashboardApiSvcMock.getOrders).toHaveBeenCalledWith(
        jasmine.objectContaining({
          OnHoldFilter: 1,
          OnHold: true,
          DiscontinuedFilter: 1,
          Discontinued: true,
        })
      );
    });

    it('should apply both billing term and reseller status filters together', () => {
      component.countryRegionCheckbox = [];
      component.approvalTypeCheckbox = [];
      component.billingTermCheckbox = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.MultiYear,
      ]);
      component.resellerStatusCheckbox = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
      ]);
      component.orderValueData = { ...component.orderValueData, min: 0, max: 0 };

      component.applyFilter();

      expect(dashboardApiSvcMock.getOrders).toHaveBeenCalledWith(
        jasmine.objectContaining({
          MultiYearContractFilter: 1,
          MultiYearContract: true,
          OnHoldFilter: 1,
          OnHold: true,
          DiscontinuedFilter: 0,
          Discontinued: false,
        })
      );
    });
  });

  describe('Clear Filters', () => {
    it('should clear billing term filter', () => {
      component.billingTermCheckbox = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.MultiYear,
      ]);

      component['clearBillingTermBtn']();

      expect(component.billingTermCheckbox.every(item => !item.checked)).toBeTrue();
      expect(component.filterCount.BillingTerm).toBe(0);
    });

    it('should clear reseller status filter', () => {
      component.resellerStatusCheckbox = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
        ResellerStatusFilterEnum.Discontinued,
      ]);

      component['clearResellerStatusBtn']();

      expect(component.resellerStatusCheckbox.every(item => !item.checked)).toBeTrue();
      expect(component.filterCount.ResellerStatus).toBe(0);
    });
  });
});
