import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ApplicationIdEnum, PermissionsEnum } from 'src/app/core/config/permissions.config';
import { PPCDashboardAPIService } from 'src/app/core/services/ppc-dashboard-api.service';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { DataState } from 'src/app/core/services/data-state';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dataStateSpy: jasmine.SpyObj<DataState>;

  const dashboardDataSvcMock = {
    orderResponseData$: of(null),
    orderAPIInProgress$: of(false),
    orderAPIFailed$: of(false),
    setOrderAPIInProgress: jasmine.createSpy('setOrderAPIInProgress'),
    setOrderResponseData: jasmine.createSpy('setOrderResponseData'),
    setActiveTabId: jasmine.createSpy('setActiveTabId'),
    getOrderRequestData: jasmine.createSpy('getOrderRequestData').and.returnValue({
      Status: '1,2,3,5,7',
      PageIndex: 0,
      PageSize: 20,
      OrderByColumn: 1,
      SortOrder: 'DESC',
    }),
    setOrderRequestData: jasmine.createSpy('setOrderRequestData'),
  };

  const dashboardApiSvcMock = {
    getOrders: jasmine.createSpy('getOrders').and.returnValue(of([])),
    orderAction: jasmine.createSpy('orderAction').and.returnValue(of(true)),
    getOrderLines: jasmine.createSpy('getOrderLines').and.returnValue(of([])),
  };

  const snackbarMock = {
    show: jasmine.createSpy('show'),
  };

  beforeEach(async () => {
    dataStateSpy = jasmine.createSpyObj<DataState>('DataState', ['hasPermission']);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        DatePipe,
        { provide: PPCDashboardDataService, useValue: dashboardDataSvcMock },
        { provide: PPCDashboardAPIService, useValue: dashboardApiSvcMock },
        { provide: PpcSnackBarService, useValue: snackbarMock },
        { provide: DataState, useValue: dataStateSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  function setPermissionState(hasCreditViewAccess: boolean, hasApprovalAccess: boolean, hasGlobalAdminAccess: boolean = false): void {
    dataStateSpy.hasPermission.and.callFake((requiredPermissions: number[], applicationId: number) => {
      if (hasGlobalAdminAccess) {
        if (applicationId === ApplicationIdEnum.StreamOneHub && requiredPermissions.includes(PermissionsEnum.GlobalAdmin)) {
          return true;
        }

        // Mirror DataState.hasPermission global-admin behavior.
        return true;
      }

      if (applicationId !== ApplicationIdEnum.C3) {
        return false;
      }

      if (requiredPermissions.includes(PermissionsEnum.PreProvisioningOrderApproval)) {
        return hasApprovalAccess;
      }

      if (requiredPermissions.includes(PermissionsEnum.PreProvisioningCredit)) {
        return hasCreditViewAccess;
      }

      return false;
    });
  }

  function initColumns(): void {
    component.initColumnManagerData();
    component.initTableColumn();
  }

  it('should create', () => {
    setPermissionState(false, true);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should keep only allowed columns for credit view-only users across all tabs', () => {
    setPermissionState(true, false);
    initColumns();

    expect(component.columnManagerData.filter(c => c.visible).map(c => c.columnKey)).toEqual([
      'Reseller Details',
      'Country',
      'Currency',
      'End Customer Cost',
      'Reseller Cost',
    ]);

    expect(component.needsApprovalColumns.map(c => c.columnKey)).toEqual([
      'statusInfo',
      'Order Details',
      'Reseller Details',
      'Country',
      'Currency',
      'End Customer Cost',
      'Reseller Cost',
    ]);

    expect(component.approvedColumns.map(c => c.columnKey)).toEqual([
      'Order Details',
      'Reseller Details',
      'Country',
      'Currency',
      'End Customer Cost',
      'Reseller Cost',
      'Approved Details',
    ]);

    expect(component.declinedColumns.map(c => c.columnKey)).toEqual([
      'Order Details',
      'Reseller Details',
      'Country',
      'Currency',
      'End Customer Cost',
      'Reseller Cost',
      'Declined Details',
    ]);
  });

  it('should hide column manager and action columns for credit view-only users', () => {
    setPermissionState(true, false);
    component.activeTab = 0;
    initColumns();

    expect(component.canShowColumnManager).toBeFalse();

    component.showColumnManager = false;
    component.columnManagerToggle(true);
    expect(component.showColumnManager).toBeFalse();

    expect(component.needsApprovalColumns.some(c => c.columnKey === 'statusInfo')).toBeTrue();
    expect(component.needsApprovalColumns.some(c => c.columnKey === 'Actions')).toBeFalse();
    expect(component.declinedColumns.some(c => c.columnKey === 'Actions')).toBeFalse();
  });

  it('should keep approval user behavior with status and actions in Needs Approval and Declined tabs', () => {
    setPermissionState(false, true);
    initColumns();

    expect(component.canShowColumnManager).toBeTrue();
    expect(component.needsApprovalColumns.some(c => c.columnKey === 'statusInfo')).toBeTrue();
    expect(component.needsApprovalColumns.some(c => c.columnKey === 'Actions')).toBeTrue();
    expect(component.declinedColumns.some(c => c.columnKey === 'Actions')).toBeTrue();
    expect(component.declinedColumns.some(c => c.columnKey === 'Declined Details')).toBeTrue();
  });

  it('should preserve credit-only restriction on column manager updates and reset', () => {
    setPermissionState(true, false);
    initColumns();

    const hiddenEverything = component.columnManagerData.map(c => ({ ...c, visible: false }));
    component.onColumnManagerChange(hiddenEverything);

    expect(component.columnManagerData.filter(c => c.visible).map(c => c.columnKey)).toEqual([
      'Reseller Details',
      'Country',
      'Currency',
      'End Customer Cost',
      'Reseller Cost',
    ]);

    component.onColumnManagerReset();
    expect(component.columnManagerData.filter(c => c.visible).map(c => c.columnKey)).toEqual([
      'Reseller Details',
      'Country',
      'Currency',
      'End Customer Cost',
      'Reseller Cost',
    ]);
  });

  it('should not apply credit view-only restriction for global admin users', () => {
    setPermissionState(true, false, true);
    initColumns();

    expect(component.isCreditViewOnly).toBeFalse();
    expect(component.canShowColumnManager).toBeTrue();
    expect(component.needsApprovalColumns.some(c => c.columnKey === 'statusInfo')).toBeTrue();
    expect(component.needsApprovalColumns.some(c => c.columnKey === 'Actions')).toBeTrue();
  });
});
