import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { PpcPaginatorDataService } from 'src/app/core/services/ppc-paginator-data.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { SubsTransferTypeEnum } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { SubsTransferCustomerPreviewPanelData } from 'src/app/models/cloud-tools/subs-transfer-preview.interface';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { SubsTransferCustomerPreviewComponent } from './subs-transfer-customer-preview.component';

describe('SubsTransferCustomerPreviewComponent', () => {
  let component: SubsTransferCustomerPreviewComponent;
  let fixture: ComponentFixture<SubsTransferCustomerPreviewComponent>;
  let cloudToolsAPIServiceSpy: jasmine.SpyObj<CloudToolsAPIService>;
  let sidePanelServiceSpy: jasmine.SpyObj<SidePanelService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackbarServiceSpy: jasmine.SpyObj<PpcSnackBarService>;
  let panelRefSpy: { close: jasmine.Spy };
  let paginatorDataService: PpcPaginatorDataService;

  const panelData: SubsTransferCustomerPreviewPanelData = {
    rows: [
      {
        region: 'US',
        customerTenantId: 'tenant-1',
        sourcePartnerName: 'Source Partner',
        sourcePartnerTenantId: '12345678-1234-1234-1234-123456789abc',
        customerEmailId: 'user@tdsynnex.com',
      },
      {
        region: 'US',
        customerTenantId: 'tenant-2',
        sourcePartnerName: 'Source Partner',
        sourcePartnerTenantId: '12345678-1234-1234-1234-123456789abc',
        customerEmailId: 'user@tdsynnex.com',
      },
    ],
    formValues: {
      region: 'US',
      transferType: SubsTransferTypeEnum.All,
      mpnId: '12345',
      sourcePartnerTenantId: '12345678-1234-1234-1234-123456789abc',
      sourcePartnerName: 'Source Partner',
      email: 'user@tdsynnex.com',
      requestedBy: 'Test User',
    },
  };

  beforeEach(async () => {
    cloudToolsAPIServiceSpy = jasmine.createSpyObj<CloudToolsAPIService>('CloudToolsAPIService', ['subsTransferUpload']);
    sidePanelServiceSpy = jasmine.createSpyObj<SidePanelService>('SidePanelService', ['open']);
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    snackbarServiceSpy = jasmine.createSpyObj<PpcSnackBarService>('PpcSnackBarService', ['show']);
    panelRefSpy = {
      close: jasmine.createSpy('close'),
    };

    cloudToolsAPIServiceSpy.subsTransferUpload.and.returnValue(of({ transactionId: 'tx-1', status: 202 }));
    dialogSpy.open.and.returnValue({
      close: jasmine.createSpy('close'),
      afterClosed: () => of('confirm'),
    } as never);

    await TestBed.configureTestingModule({
      declarations: [SubsTransferCustomerPreviewComponent],
      providers: [
        PpcPaginatorDataService,
        { provide: CloudToolsAPIService, useValue: cloudToolsAPIServiceSpy },
        { provide: SidePanelService, useValue: sidePanelServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PpcSnackBarService, useValue: snackbarServiceSpy },
        { provide: SIDE_PANEL_REF, useValue: panelRefSpy },
        { provide: SIDE_PANEL_DATA, useValue: panelData },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubsTransferCustomerPreviewComponent);
    component = fixture.componentInstance;
    paginatorDataService = TestBed.inject(PpcPaginatorDataService);
    fixture.detectChanges();
  });

  it('should create and initialize first page table data', () => {
    expect(component).toBeTruthy();
    expect(component.tableData.length).toBe(2);
    expect(component.displayedTableData.length).toBe(2);
    expect(component.paginatorData.total).toBe(2);
  });

  it('should update loading overlay on paginator event and filter data', () => {
    paginatorDataService.setPPCPageChangeEventData({ page: 1, pageSize: 1 });

    expect(component.showLoadingOverlay).toBeFalse();
    expect(component.displayedTableData.length).toBe(1);
  });

  it('should open upload confirmation dialog and call upload API on confirm', () => {
    component.showDialog();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(cloudToolsAPIServiceSpy.subsTransferUpload).toHaveBeenCalledWith({
      region: 'US',
      transferType: SubsTransferTypeEnum.All,
      mpnId: '12345',
      sourcePartnerTenantId: '12345678-1234-1234-1234-123456789abc',
      sourcePartnerName: 'Source Partner',
      customerEmail: 'user@tdsynnex.com',
      requestedBy: 'Test User',
    });
    expect(snackbarServiceSpy.show).toHaveBeenCalledWith('Subscription transfer confirmed and uploaded successfully.', 5000);
    expect(panelRefSpy.close).toHaveBeenCalled();
    expect(component.showLoadingOverlay).toBeFalse();
  });

  it('should navigate back to upload panel when user clicks cancel', () => {
    component.closeHandler();

    expect(sidePanelServiceSpy.open).toHaveBeenCalled();
    const openCallArg = sidePanelServiceSpy.open.calls.mostRecent().args[1] as { data: { type: string } };
    expect(openCallArg.data.type).toBe('SubscriptionTransfer');
  });

  it('should pass API error message back to upload panel on upload failure', () => {
    cloudToolsAPIServiceSpy.subsTransferUpload.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Upload rejected by API' } })),
    );

    component['handleConfirmAction']();

    const openCallArg = sidePanelServiceSpy.open.calls.mostRecent().args[1] as { data: { uploadError: string } };
    expect(openCallArg.data.uploadError).toBe('Error uploading file in subscription transfer. Please try again later.');
    expect(component.showLoadingOverlay).toBeFalse();
  });

  it('should pass generic error back to upload panel for upload 500 failure', () => {
    cloudToolsAPIServiceSpy.subsTransferUpload.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: 'Internal Server Error' })),
    );

    component['handleConfirmAction']();

    const openCallArg = sidePanelServiceSpy.open.calls.mostRecent().args[1] as { data: { uploadError: string } };
    expect(openCallArg.data.uploadError).toBe('Error uploading file in subscription transfer. Please try again later.');
    expect(component.showLoadingOverlay).toBeFalse();
  });

  it('should navigate back to upload panel when payload is invalid and skip upload API', () => {
    const invalidDataFixture = TestBed.createComponent(SubsTransferCustomerPreviewComponent);
    const invalidComponent = invalidDataFixture.componentInstance;
    (invalidComponent as unknown as { data: SubsTransferCustomerPreviewPanelData }).data = {
      ...panelData,
      formValues: {
        ...panelData.formValues,
        transferType: 'UnsupportedTransferType',
        requestedBy: 'Test User',
      },
    };

    invalidComponent['handleConfirmAction']();

    expect(cloudToolsAPIServiceSpy.subsTransferUpload).not.toHaveBeenCalled();
    expect(sidePanelServiceSpy.open).toHaveBeenCalled();
  });

  it('should keep loader visible during pending upload request', () => {
    const uploadSubject = new Subject<{ transactionId: string; status: number }>();
    cloudToolsAPIServiceSpy.subsTransferUpload.and.returnValue(uploadSubject.asObservable());

    component['handleConfirmAction']();
    expect(component.showLoadingOverlay).toBeTrue();

    uploadSubject.next({ transactionId: 'tx-2', status: 202 });
    uploadSubject.complete();

    expect(component.showLoadingOverlay).toBeFalse();
  });
});
