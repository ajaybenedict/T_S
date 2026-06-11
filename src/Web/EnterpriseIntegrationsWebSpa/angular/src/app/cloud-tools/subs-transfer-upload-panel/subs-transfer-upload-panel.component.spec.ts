import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { SubscriptionTransferCustomer, SubsTransferRegion } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { PanelData } from '../upload-panel/upload-panel.component';
import { SubsTransferUploadPanelComponent } from './subs-transfer-upload-panel.component';

describe('SubsTransferUploadPanelComponent', () => {
  let component: SubsTransferUploadPanelComponent;
  let fixture: ComponentFixture<SubsTransferUploadPanelComponent>;
  let cloudToolsAPIServiceSpy: jasmine.SpyObj<CloudToolsAPIService>;
  let sidePanelServiceSpy: jasmine.SpyObj<SidePanelService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let panelRefSpy: { close: jasmine.Spy };

  const regionResponse: SubsTransferRegion[] = [
    {
      regionId: 1,
      regionKey: 'US',
      regionName: 'United States',
      geoLocation: 'NAM',
      regionType: 'Primary',
      isEnabled: true,
      country: {
        countryId: '1',
        countryName: 'United States',
        countryCode2: 'US',
        countryCode3: 'USA',
      },
      vendor: {
        vendorId: 100,
        vendorKey: 'MS',
        vendorName: 'Microsoft',
        isEnabled: true,
      },
    },
  ];

  const panelData: PanelData = {
    type: 'SubscriptionTransfer',
    subsTransferFormValues: {
      region: 'US',
      transferType: 'All',
      mpnId: '12345',
      sourcePartnerTenantId: '12345678-1234-1234-1234-123456789abc',
      sourcePartnerName: 'Source Partner',
      email: 'user@tdsynnex.com',
      requestedBy: 'Test User',
    },
    uploadError: 'Upload failed in previous step',
  };

  function createPasteInput(value = '', selectionStart = 0, selectionEnd = selectionStart): HTMLInputElement {
    const input = {
      value,
      selectionStart,
      selectionEnd,
      setRangeText(replacement: string, start: number, end: number, selectionMode?: string) {
        input.value = `${input.value.slice(0, start)}${replacement}${input.value.slice(end)}`;
        const newPosition = start + replacement.length;
        if (selectionMode === 'end') {
          input.selectionStart = newPosition;
          input.selectionEnd = newPosition;
        }
      },
      setSelectionRange: jasmine.createSpy('setSelectionRange'),
    };

    return input as unknown as HTMLInputElement;
  }

  beforeEach(async () => {
    cloudToolsAPIServiceSpy = jasmine.createSpyObj<CloudToolsAPIService>('CloudToolsAPIService', [
      'getSubscriptionTransferRegions',
      'getSubscriptionTransferCustomers',
    ]);
    sidePanelServiceSpy = jasmine.createSpyObj<SidePanelService>('SidePanelService', ['open']);
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    panelRefSpy = {
      close: jasmine.createSpy('close'),
    };

    cloudToolsAPIServiceSpy.getSubscriptionTransferRegions.and.returnValue(of(regionResponse));
    dialogSpy.open.and.returnValue({
      close: jasmine.createSpy('close'),
      afterClosed: () => of(false),
    } as never);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SubsTransferUploadPanelComponent],
      providers: [
        FormBuilder,
        { provide: CloudToolsAPIService, useValue: cloudToolsAPIServiceSpy },
        { provide: SidePanelService, useValue: sidePanelServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SIDE_PANEL_REF, useValue: panelRefSpy },
        { provide: SIDE_PANEL_DATA, useValue: panelData },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideTemplate(SubsTransferUploadPanelComponent, '');
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(SubsTransferUploadPanelComponent);
    component = fixture.componentInstance;
    (component as any).initializeForm();
    component.ngOnInit();
  });

  function setValidFormValues(): void {
    component.panelForm.patchValue({
      region: { label: 'US', value: 'US' },
      transferType: { label: 'All', value: 'All' },
      mpnId: '12345',
      sourcePartnerTenantId: '12345678-1234-1234-1234-123456789abc',
      sourcePartnerName: 'Source Partner',
      email: 'user@tdsynnex.com',
      requestedBy: 'Test User',
    });
  }

  it('should initialize regions and include upload error passed via side panel data', () => {
    expect(component).toBeTruthy();
    expect(cloudToolsAPIServiceSpy.getSubscriptionTransferRegions).toHaveBeenCalled();
    expect(component.regionDropdownOptions).toEqual([{ label: 'US', value: 'US' }]);
    expect(component.showOverlay).toBeFalse();
    expect(component.uploadErrors).toContain('Upload failed in previous step');
  });

  it('should validate region before calling customers API', () => {
    setValidFormValues();
    component.uploadErrors = [];
    component.panelForm.patchValue({ region: { label: '', value: '' } });

    component.onProceedClick();

    expect(cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers).not.toHaveBeenCalled();
    expect(component.uploadErrors).toContain('Please select a valid region.');
  });

  it('should validate MPNID format before calling customers API', () => {
    setValidFormValues();
    component.uploadErrors = [];
    component.panelForm.patchValue({ mpnId: 'abc' });

    component.onProceedClick();

    expect(cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers).not.toHaveBeenCalled();
    expect(component.uploadErrors).toContain('Please provide a valid MPNID.');
  });

  it('should validate email errors before calling customers API', () => {
    setValidFormValues();
    component.uploadErrors = [];
    component.panelForm.get('email')?.setErrors({ invalidEmailFormat: true });

    component.onProceedClick();

    expect(cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers).not.toHaveBeenCalled();
    expect(component.uploadErrors).toEqual([]);
  });

  it('should call customers API on proceed and open preview panel when records are returned', () => {
    const customers: SubscriptionTransferCustomer[] = [
      {
        id: 'customer-1',
        relationshipToPartner: 'Direct',
        companyProfile: {
          tenantId: 'tenant-1',
          domain: 'tenant.example.com',
          companyName: 'Contoso',
        },
      },
    ];
    cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers.and.returnValue(of(customers));
    setValidFormValues();

    component.onProceedClick();

    expect(cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers).toHaveBeenCalledWith('US', '12345');
    expect(sidePanelServiceSpy.open).toHaveBeenCalled();
    expect(component.showOverlay).toBeFalse();
  });

  it('should open no-customer dialog and stop overlay when customers API returns empty', () => {
    cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers.and.returnValue(of([]));
    setValidFormValues();

    component.onProceedClick();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(component.showOverlay).toBeFalse();
  });

  it('should show API message error when customers API fails', () => {
    const apiError = new HttpErrorResponse({
      status: 400,
      error: { message: 'Invalid region selected' },
    });
    cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers.and.returnValue(throwError(() => apiError));
    setValidFormValues();

    component.onProceedClick();

    expect(component.uploadErrors).toContain('Invalid region selected');
    expect(component.showOverlay).toBeFalse();
  });

  it('should show generic error for customers API 500 failure', () => {
    const apiError = new HttpErrorResponse({
      status: 500,
      error: 'Internal Server Error',
    });
    cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers.and.returnValue(throwError(() => apiError));
    setValidFormValues();

    component.onProceedClick();

    expect(component.uploadErrors).toContain('Something went wrong. Please try again later.');
    expect(component.showOverlay).toBeFalse();
  });

  it('should keep loader visible during pending customers API request', () => {
    const customersSubject = new Subject<SubscriptionTransferCustomer[]>();
    cloudToolsAPIServiceSpy.getSubscriptionTransferCustomers.and.returnValue(customersSubject.asObservable());
    setValidFormValues();

    component.onProceedClick();
    expect(component.showOverlay).toBeTrue();

    customersSubject.next([]);
    customersSubject.complete();

    expect(component.showOverlay).toBeFalse();
  });

  it('should show load regions error when regions API fails', () => {
    const failingService = TestBed.inject(CloudToolsAPIService) as jasmine.SpyObj<CloudToolsAPIService>;
    failingService.getSubscriptionTransferRegions.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: 'Region service down' })),
    );

    const localFixture = TestBed.createComponent(SubsTransferUploadPanelComponent);
    const localComponent = localFixture.componentInstance;
    (localComponent as any).initializeForm();
    localComponent.ngOnInit();

    expect(localComponent.regionDropdownOptions).toEqual([]);
    expect(localComponent.uploadErrors).toContain('Failed to load regions. Please try again later.');
    expect(localComponent.showOverlay).toBeFalse();
  });

  describe('Filename-Safe Validation for Requested By', () => {
    it('should allow only allowed characters (letters, numbers, space, hyphen, underscore)', () => {
      const allowed = 'Test_User-123 Name';
      component.panelForm.patchValue({ requestedBy: allowed });
      const mockEvent = { target: { value: allowed } } as any;
      component.onRequestedByInput(mockEvent);
      expect(component.panelForm.get('requestedBy')?.value).toBe(allowed);
    });

    it('should remove all other special characters', () => {
      const input = { value: 'Test@User!#%&*()^$' } as HTMLInputElement;
      const mockEvent = { target: input } as any;
      component.onRequestedByInput(mockEvent);
      expect(input.value).toBe('TestUser');
      expect(component.panelForm.get('requestedBy')?.value).toBe('TestUser');
    });

    it('should remove mixed invalid and valid characters', () => {
      const input = { value: 'A_B-C D@E#F$' } as HTMLInputElement;
      const mockEvent = { target: input } as any;
      component.onRequestedByInput(mockEvent);
      expect(input.value).toBe('A_B-C DEF');
      expect(component.panelForm.get('requestedBy')?.value).toBe('A_B-C DEF');
    });

    it('should remove tabs and newlines from requestedBy', () => {
      const input = { value: 'A_B-C\tD\nE F' } as HTMLInputElement;
      const mockEvent = { target: input } as any;
      component.onRequestedByInput(mockEvent);
      expect(input.value).toBe('A_B-CDE F');
      expect(component.panelForm.get('requestedBy')?.value).toBe('A_B-CDE F');
    });

    it('should remove colons from requestedBy', () => {
      const input = { value: 'user:name' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should remove asterisks from requestedBy', () => {
      const input = { value: 'user*name' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should remove question marks from requestedBy', () => {
      const input = { value: 'user?name' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should remove quotes from requestedBy', () => {
      const input = { value: 'user"name' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should remove angle brackets from requestedBy', () => {
      const input = { value: 'user<name>' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should remove pipe characters from requestedBy', () => {
      const input = { value: 'user|name' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should remove all invalid filename characters in complex input', () => {
      const input = { value: 'user/\\:*?"<>|name' } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value).toBe('username');
      expect(component.panelForm.get('requestedBy')?.value).toBe('username');
    });

    it('should not update form when sanitized value matches original', () => {
      component.panelForm.patchValue({ requestedBy: 'ValidUser123' });
      const input = { value: 'ValidUser123' } as HTMLInputElement;
      const mockEvent = { target: input } as any;
      spyOn(component.panelForm.get('requestedBy')!, 'setValue');

      component.onRequestedByInput(mockEvent);

      expect(component.panelForm.get('requestedBy')?.setValue).not.toHaveBeenCalled();
    });
  });

  describe('Max Length Validation for Requested By', () => {
    it('should truncate input when exceeding 100 characters', () => {
      const longValue = 'A'.repeat(150);
      const input = { value: longValue } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(component.panelForm.get('requestedBy')?.value.length).toBeLessThanOrEqual(100);
      expect(component.panelForm.get('requestedBy')?.value).toBe('A'.repeat(100));
    });

    it('should allow exactly 100 characters', () => {
      const exactValue = 'B'.repeat(100);
      component.panelForm.patchValue({ requestedBy: exactValue });
      const input = { value: exactValue } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe(exactValue);
      expect(component.panelForm.get('requestedBy')?.value.length).toBe(100);
    });

    it('should allow 99 characters', () => {
      const value = 'C'.repeat(99);
      component.panelForm.patchValue({ requestedBy: value });
      const input = { value: value } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe(value);
      expect(component.panelForm.get('requestedBy')?.value.length).toBe(99);
    });

    it('should combine max length and character sanitization', () => {
      const longDirtyValue = 'user/name'.repeat(20) + ':::***???';
      const input = { value: longDirtyValue } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      const result = component.panelForm.get('requestedBy')?.value;
      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).not.toContain('/');
      expect(result).not.toContain(':');
      expect(result).not.toContain('*');
      expect(result).not.toContain('?');
    });

    it('should handle max length with valid characters with spaces', () => {
      const value = 'John Doe '.repeat(15);
      const input = { value: value } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(component.panelForm.get('requestedBy')?.value.length).toBeLessThanOrEqual(100);
    });

    it('should not exceed 100 chars when given more with invalid characters', () => {
      const value = ('user/name').repeat(13);
      const input = { value: value } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(component.panelForm.get('requestedBy')?.value.length).toBeLessThanOrEqual(100);
    });

    it('should handle max length with hyphen and underscore characters', () => {
      const value = 'user-name_'.repeat(20);
      const input = { value: value } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      const result = component.panelForm.get('requestedBy')?.value;
      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).toContain('-');
      expect(result).toContain('_');
    });

    it('should update input element value when truncating', () => {
      const longValue = 'Test'.repeat(50);
      const input = { value: longValue } as HTMLInputElement;
      const mockEvent = { target: input } as any;

      component.onRequestedByInput(mockEvent);

      expect(input.value.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Paste Event Handling for Requested By', () => {
    it('should sanitize pasted valid content', () => {
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'John Doe' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(component.panelForm.get('requestedBy')?.value).toBe('John Doe');
      expect(input.selectionStart).toBe(8);
      expect(input.selectionEnd).toBe(8);
    });

    it('should sanitize pasted content with invalid characters', () => {
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'user/name:test*' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe('usernametest');
      expect(component.panelForm.get('requestedBy')?.value).not.toContain('/');
      expect(component.panelForm.get('requestedBy')?.value).not.toContain(':');
      expect(component.panelForm.get('requestedBy')?.value).not.toContain('*');
    });

    it('should enforce max length on pasted content exceeding 100 chars', () => {
      const longContent = 'A'.repeat(150);
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => longContent }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.panelForm.get('requestedBy')?.value.length).toBeLessThanOrEqual(100);
      expect(component.panelForm.get('requestedBy')?.value).toBe('A'.repeat(100));
    });

    it('should handle pasting in the middle of existing text', () => {
      component.panelForm.patchValue({ requestedBy: 'Hello World' });
      const input = createPasteInput('Hello World', 5, 5);
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => ' John' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe('Hello John World');
      expect(input.selectionStart).toBe(10);
      expect(input.selectionEnd).toBe(10);
    });

    it('should handle pasting with selection replacement', () => {
      component.panelForm.patchValue({ requestedBy: 'Hello World' });
      const input = createPasteInput('Hello World', 0, 5);
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'Goodbye' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe('Goodbye World');
      expect(input.selectionStart).toBe(7);
      expect(input.selectionEnd).toBe(7);
    });

    it('should handle pasting content with mixed valid and invalid characters', () => {
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'user/name_123:test-value' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe('username_123test-value');
      expect(component.panelForm.get('requestedBy')?.value).toContain('_');
      expect(component.panelForm.get('requestedBy')?.value).toContain('-');
    });

    it('should prevent default paste and handle with clipboard data', () => {
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'Test Data' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(pasteEvent.preventDefault).toHaveBeenCalled();
    });

    it('should update input element value when pasting', () => {
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'Pasted Content' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(input.value).toBe('Pasted Content');
    });

    it('should combine max length and sanitization for pasted content', () => {
      const longDirtyContent = ('user/name').repeat(20) + ':::***???';
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => longDirtyContent }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      const result = component.panelForm.get('requestedBy')?.value;
      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).not.toContain('/');
      expect(result).not.toContain(':');
      expect(result).not.toContain('*');
    });

    it('should only insert the remaining allowed characters when nearing max length', () => {
      const existingValue = 'A'.repeat(98);
      const input = createPasteInput(existingValue, 98, 98);
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'BCDE' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.panelForm.get('requestedBy')?.value).toBe(`${existingValue}BC`);
      expect(input.selectionStart).toBe(100);
      expect(input.selectionEnd).toBe(100);
    });

    it('should not call setSelectionRange when setRangeText handles caret placement', () => {
      const input = createPasteInput('Hello', 5, 5) as unknown as { setSelectionRange: jasmine.Spy } & HTMLInputElement;
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => ' World' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(input.setSelectionRange).not.toHaveBeenCalled();
    });
  });

});
