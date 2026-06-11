import { DatePipe } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { PermissionsEnum } from 'src/app/core/config/permissions.config';
import { CLOUD_TOOLS_ROUTE } from 'src/app/core/constants/constants';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { DataState } from 'src/app/core/services/data-state';
import { PermissionsLoaderDialogService } from 'src/app/core/services/permissions-loader-dialog.service';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { CloudToolsStatusIdEnum, CloudToolsTaskIdEnum, TransactionResponse } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { CloudToolsDashboardComponent } from './cloud-tools-dashboard.component';

describe('CloudToolsDashboardComponent', () => {
  let component: CloudToolsDashboardComponent;
  let fixture: ComponentFixture<CloudToolsDashboardComponent>;
  let cloudToolsAPIServiceSpy: jasmine.SpyObj<CloudToolsAPIService>;
  let cloudToolsDataService: CloudToolsDataService;
  let activatedRouteUrl$: BehaviorSubject<UrlSegment[]>;
  let activatedRouteData$: BehaviorSubject<{ [key: string]: unknown }>;

  const transactionResponse: TransactionResponse = {
    transactions: [
      {
        id: 'tx-parent-1',
        createdOn: '2026-03-01T00:00:00.000Z',
        createdBy: 'tester',
        requestedBy: 'tester',
        taskId: CloudToolsTaskIdEnum.SubscriptionTransfer,
        taskName: 'SubscriptionTransfer',
      },
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10,
    timestamp: '2026-03-01T00:00:00.000Z',
    message: null,
  };

  beforeEach(async () => {
    activatedRouteUrl$ = new BehaviorSubject<UrlSegment[]>([]);
    activatedRouteData$ = new BehaviorSubject<{ [key: string]: unknown }>({});

    cloudToolsAPIServiceSpy = jasmine.createSpyObj<CloudToolsAPIService>('CloudToolsAPIService', [
      'getTransactions',
      'getTransactionDetails',
      'downloadTransaction',
    ]);
    cloudToolsAPIServiceSpy.getTransactions.and.returnValue(of(transactionResponse));
    cloudToolsAPIServiceSpy.getTransactionDetails.and.returnValue(of({
      transactions: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      timestamp: '',
      message: null,
    }));
    cloudToolsAPIServiceSpy.downloadTransaction.and.returnValue(of({
      body: new Blob(['csv'], { type: 'text/csv' }),
      headers: new HttpHeaders({ 'content-disposition': 'attachment; filename="transaction-export.csv"' }),
    } as any));

    const dataStateSpy = jasmine.createSpyObj<DataState>('DataState', ['getUserPermissions', 'hasPermission']);
    dataStateSpy.getUserPermissions.and.returnValue([PermissionsEnum.SubscriptionTransfer]);
    dataStateSpy.hasPermission.and.returnValue(true);

    const permissionDialogSpy = jasmine.createSpyObj<PermissionsLoaderDialogService>('PermissionsLoaderDialogService', ['showDialog', 'closeDialog']);
    const sidePanelServiceSpy = jasmine.createSpyObj<SidePanelService>('SidePanelService', ['open']);

    await TestBed.configureTestingModule({
      declarations: [CloudToolsDashboardComponent],
      providers: [
        DatePipe,
        PpcPaginatorDataService,
        CloudToolsDataService,
        { provide: CloudToolsAPIService, useValue: cloudToolsAPIServiceSpy },
        { provide: DataState, useValue: dataStateSpy },
        { provide: PermissionsLoaderDialogService, useValue: permissionDialogSpy },
        { provide: SidePanelService, useValue: sidePanelServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            url: activatedRouteUrl$.asObservable(),
            data: activatedRouteData$.asObservable(),
            snapshot: {
              routeConfig: { path: CLOUD_TOOLS_ROUTE.SUBS_TRANSFER },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CloudToolsDashboardComponent);
    component = fixture.componentInstance;
    cloudToolsDataService = TestBed.inject(CloudToolsDataService);
    fixture.detectChanges();
  });

  it('should initialize dashboard with resolved subscription transfer transactions', () => {
    activatedRouteUrl$.next([new UrlSegment(CLOUD_TOOLS_ROUTE.SUBS_TRANSFER, {})]);
    activatedRouteData$.next({ toolType: transactionResponse });

    expect(component).toBeTruthy();
    expect(component.tableData.length).toBe(1);
    expect(component.tableData[0].id).toBe('tx-parent-1');
    expect(component.isPaginatorVisible).toBeTrue();
  });

  it('should call transactions API with in-progress status when tab switches to in-progress', () => {
    activatedRouteUrl$.next([new UrlSegment(CLOUD_TOOLS_ROUTE.SUBS_TRANSFER, {})]);
    activatedRouteData$.next({ toolType: transactionResponse });

    component.tabChangeHandler(1);

    expect(cloudToolsAPIServiceSpy.getTransactions).toHaveBeenCalled();
    const requestPayload = cloudToolsAPIServiceSpy.getTransactions.calls.mostRecent().args[0];
    expect(requestPayload.statusIds).toEqual([CloudToolsStatusIdEnum.InProgress]);
    expect(requestPayload.pageNumber).toBe(1);
    expect(requestPayload.pageSize).toBe(10);
    expect(requestPayload.taskIds).toEqual([CloudToolsTaskIdEnum.SubscriptionTransfer]);
  });

  it('should call transactions API with date range payload when date changes', () => {
    activatedRouteUrl$.next([new UrlSegment(CLOUD_TOOLS_ROUTE.SUBS_TRANSFER, {})]);
    activatedRouteData$.next({ toolType: transactionResponse });

    component.dateRangeEventHandler({ start: '2026-03-01', end: '2026-03-10' });

    expect(cloudToolsAPIServiceSpy.getTransactions).toHaveBeenCalled();
    const requestPayload = cloudToolsAPIServiceSpy.getTransactions.calls.mostRecent().args[0];
    expect(requestPayload.fromDate instanceof Date).toBeTrue();
    expect(requestPayload.toDate instanceof Date).toBeTrue();
    expect(requestPayload.fromDate?.toISOString().startsWith('2026-03-01')).toBeTrue();
    expect(requestPayload.toDate?.toISOString().startsWith('2026-03-10')).toBeTrue();
    expect(requestPayload.sortBy).toBe('CreatedDate');
    expect(requestPayload.sortDescending).toBeTrue();
    expect(requestPayload.taskIds).toEqual([CloudToolsTaskIdEnum.SubscriptionTransfer]);
  });

  it('should skip date API call when start and end are same', () => {
    activatedRouteUrl$.next([new UrlSegment(CLOUD_TOOLS_ROUTE.SUBS_TRANSFER, {})]);
    activatedRouteData$.next({ toolType: transactionResponse });
    cloudToolsAPIServiceSpy.getTransactions.calls.reset();

    component.dateRangeEventHandler({ start: '2026-03-01', end: '2026-03-01' });

    expect(cloudToolsAPIServiceSpy.getTransactions).not.toHaveBeenCalled();
  });

  it('should update overlay when transaction API in-progress state changes', () => {
    cloudToolsDataService.setTransactionAPIInProgress(true);
    expect(component.showOverlay).toBeTrue();

    cloudToolsDataService.setTransactionAPIInProgress(false);
    expect(component.showOverlay).toBeFalse();
  });

  it('should show download action only when a row is selected', () => {
    expect(component.shouldShowDownloadAction()).toBeFalse();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img[alt="Download"]')).toBeFalsy();

    const row = transactionResponse.transactions[0] as any;
    component.tableRowClickHandler(row);
    fixture.detectChanges();

    expect(component.selectedTransactionId).toBe('tx-parent-1');
    expect(component.shouldShowDownloadAction()).toBeTrue();
    expect(fixture.nativeElement.querySelector('img[alt="Download"]')).toBeTruthy();

    component.detailsCardDismissEventHandler();
    fixture.detectChanges();

    expect(component.selectedTransactionId).toBeNull();
    expect(component.shouldShowDownloadAction()).toBeFalse();
    expect(fixture.nativeElement.querySelector('img[alt="Download"]')).toBeFalsy();
  });

  it('should not call download API when no row is selected', () => {
    component.selectedTransactionId = null;

    component.downloadCSV();

    expect(cloudToolsAPIServiceSpy.downloadTransaction).not.toHaveBeenCalled();
  });

  it('should download selected transaction using filename from content-disposition', () => {
    component.selectedTransactionId = 'tx-parent-1';

    const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:download-url');
    const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');
    const anchor = document.createElement('a');
    const clickSpy = spyOn(anchor, 'click');
    const removeSpy = spyOn(anchor, 'remove');
    const appendChildSpy = spyOn(document.body, 'appendChild').and.callFake(<T extends Node>(node: T) => node);
    const createElementSpy = spyOn(document, 'createElement').and.callFake((tag: string) => {
      if (tag === 'a') {
        return anchor;
      }
      return document.createElement(tag);
    });

    component.downloadCSV();

    expect(cloudToolsAPIServiceSpy.downloadTransaction).toHaveBeenCalledWith('tx-parent-1');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
    expect(anchor.download).toBe('transaction-export.csv');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:download-url');
  });

  it('should prefer filename* over filename when both are present', () => {
    const header = 'attachment; filename=legacy.csv; filename*=UTF-8\'\'preferred.csv';

    const result = (component as any).getDownloadFileName(header, 'tx-parent-1');

    expect(result).toBe('preferred.csv');
  });

  it('should decode percent-encoded filename* values', () => {
    const header = 'attachment; filename*=UTF-8\'\'Arora%20Pulkit%20MpnIdUpdate.csv';

    const result = (component as any).getDownloadFileName(header, 'tx-parent-1');

    expect(result).toBe('Arora Pulkit MpnIdUpdate.csv');
  });

  it('should fallback to filename when filename* is not present', () => {
    const header = 'attachment; filename="fallback-name.csv"';

    const result = (component as any).getDownloadFileName(header, 'tx-parent-1');

    expect(result).toBe('fallback-name.csv');
  });

  it('should fallback to default filename when header is missing', () => {
    const result = (component as any).getDownloadFileName(null, 'tx-parent-1');

    expect(result).toBe('transaction_tx-parent-1.csv');
  });

  it('should return raw filename* value when decoding fails', () => {
    const header = 'attachment; filename*=UTF-8\'\'invalid%2';

    const result = (component as any).getDownloadFileName(header, 'tx-parent-1');

    expect(result).toBe('invalid%2');
  });
});
