import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { CloudTools } from 'src/app/core/config/cloud-tools.config';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';

import { UploadPanelComponent } from './upload-panel.component';

describe('UploadPanelComponent', () => {
  let component: UploadPanelComponent;
  let fixture: ComponentFixture<UploadPanelComponent>;
  let cloudToolsAPIServiceSpy: jasmine.SpyObj<CloudToolsAPIService>;
  let cloudToolsDataServiceSpy: jasmine.SpyObj<CloudToolsDataService>;
  let snackbarServiceSpy: jasmine.SpyObj<PpcSnackBarService>;
  let panelRefSpy: { close: jasmine.Spy };

  const panelData = {
    type: 'SubscriptionTransfer' as CloudTools,
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
    cloudToolsAPIServiceSpy = jasmine.createSpyObj<CloudToolsAPIService>('CloudToolsAPIService', ['uploadFileToCloudTools']);
    cloudToolsDataServiceSpy = jasmine.createSpyObj<CloudToolsDataService>('CloudToolsDataService', ['setUploadAPIState']);
    snackbarServiceSpy = jasmine.createSpyObj<PpcSnackBarService>('PpcSnackBarService', ['show']);
    panelRefSpy = {
      close: jasmine.createSpy('close'),
    };

    cloudToolsAPIServiceSpy.uploadFileToCloudTools.and.returnValue(of({ transactionId: 'tx-1', status: 202 }));

    await TestBed.configureTestingModule({
      declarations: [UploadPanelComponent],
      providers: [
        { provide: CloudToolsAPIService, useValue: cloudToolsAPIServiceSpy },
        { provide: CloudToolsDataService, useValue: cloudToolsDataServiceSpy },
        { provide: PpcSnackBarService, useValue: snackbarServiceSpy },
        { provide: SIDE_PANEL_DATA, useValue: panelData },
        { provide: SIDE_PANEL_REF, useValue: panelRefSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show success snackbar when upload API returns accepted', () => {
    component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
    component.requestedBy = 'Test User';
    component.uploadAPIURL = '/api/upload';

    component.onConfirm();

    expect(cloudToolsAPIServiceSpy.uploadFileToCloudTools).toHaveBeenCalled();
    expect(cloudToolsDataServiceSpy.setUploadAPIState).toHaveBeenCalledWith('Success');
    expect(snackbarServiceSpy.show).toHaveBeenCalledWith('File has been uploaded successfully.', 5000);
  });

  describe('Validation - Proceed Button Enable/Disable', () => {
    it('should disable Proceed button when no file is selected', () => {
      component.requestedBy = 'Test User';
      component.selectedFile = null;

      component.onFileReceived(null);

      expect(component.isButtonValid).toBeFalse();
    });

    it('should disable Proceed button when requestedBy is empty', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.requestedBy = '';

      component.onRequestedByChange({
        target: { value: '' } as unknown as Event
      } as unknown as Event);

      expect(component.isButtonValid).toBeFalse();
    });

    it('should disable Proceed button when requestedBy contains only whitespace', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: '   ' } as unknown as Event
      } as unknown as Event);

      expect(component.isButtonValid).toBeFalse();
    });

    it('should enable Proceed button when both file and requestedBy are provided', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'Test User' } as unknown as Event
      } as unknown as Event);

      expect(component.isButtonValid).toBeTrue();
    });

    it('should disable Proceed button when requestedBy is provided but no file is selected', () => {
      component.selectedFile = null;

      component.onRequestedByChange({
        target: { value: 'Test User' } as unknown as Event
      } as unknown as Event);

      expect(component.isButtonValid).toBeFalse();
    });
  });

  describe('Requested By Input Handler', () => {
    it('should update requestedBy when onRequestedByChange is called', () => {
      const testValue = 'John Doe';
      component.onRequestedByChange({ target: { value: testValue } as unknown as Event } as unknown as Event);
      expect(component.requestedBy).toBe(testValue);
    });

    it('should handle null target gracefully in onRequestedByChange', () => {
      component.onRequestedByChange({ target: null } as unknown as Event);
      expect(component.requestedBy).toBe('');
    });

    it('should trim whitespace from requestedBy for validation', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.onRequestedByChange({ target: { value: '  Valid User  ' } as unknown as Event } as unknown as Event);
      expect(component.requestedBy).toBe('  Valid User  ');
      expect(component.isButtonValid).toBeTrue();
    });

    it('should allow only allowed characters (letters, numbers, space, hyphen, underscore)', () => {
      const allowed = 'Test_User-123 Name';
      component.onRequestedByChange({ target: { value: allowed } as unknown as Event } as unknown as Event);
      expect(component.requestedBy).toBe(allowed);
    });

    it('should remove all other special characters', () => {
      const input = 'Test@User!#%&*()^$';
      component.onRequestedByChange({ target: { value: input } as unknown as Event } as unknown as Event);
      expect(component.requestedBy).toBe('TestUser');
    });

    it('should remove mixed invalid and valid characters', () => {
      const input = 'A_B-C D@E#F$';
      component.onRequestedByChange({ target: { value: input } as unknown as Event } as unknown as Event);
      expect(component.requestedBy).toBe('A_B-C DEF');
    });

    it('should remove tabs and newlines from requestedBy', () => {
      const input = 'A_B-C\tD\nE F';
      component.onRequestedByChange({ target: { value: input } as unknown as Event } as unknown as Event);
      expect(component.requestedBy).toBe('A_B-CDE F');
    });
  });

  describe('Reset Functionality', () => {
    it('should clear requestedBy and selectedFile on reset', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.requestedBy = 'Test User';
      component.isButtonValid = true;

      component.reset();

      expect(component.selectedFile).toBeNull();
      expect(component.requestedBy).toBe('');
      expect(component.isButtonValid).toBeFalse();
    });

    it('should clear uploadErrors on reset', () => {
      component.uploadErrors = ['Error 1', 'Error 2'];

      component.reset();

      expect(component.uploadErrors.length).toBe(0);
    });
  });

  describe('File Error Handling', () => {
    it('should disable button when file error occurs', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.requestedBy = 'Test User';
      component.isButtonValid = true;

      component.onFileError('Invalid file format');

      expect(component.isButtonValid).toBeFalse();
    });

    it('should clear uploadErrors when onFileError is called with null', () => {
      component.uploadErrors = ['Previous error'];

      component.onFileError(null);

      expect(component.uploadErrors.length).toBe(0);
    });

    it('should add error message when onFileError is called with a message', () => {
      const errorMsg = 'File size exceeds limit';

      component.onFileError(errorMsg);

      expect(component.uploadErrors).toContain(errorMsg);
    });
  });

  describe('Filename-Safe Validation for Requested By', () => {
    it('should allow alphanumeric characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'User123' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('User123');
      expect(component.isButtonValid).toBeTrue();
    });

    it('should allow spaces', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'John Doe' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('John Doe');
      expect(component.isButtonValid).toBeTrue();
    });

    it('should allow hyphens and underscores', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user-name_123' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('user-name_123');
      expect(component.isButtonValid).toBeTrue();
    });

    it('should remove forward slashes', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user/name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove backslashes', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user\\name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove colons', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user:name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove asterisks', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user*name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove question marks', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user?name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove quotes', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user"name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove angle brackets', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user<name>' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove pipe characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user|name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should remove all invalid filename characters in complex input', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: 'user/\\:*?"<>|name' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('username');
    });

    it('should disable button when requestedBy becomes empty after sanitization', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      component.onRequestedByChange({
        target: { value: '//\\\\::' } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('');
      expect(component.isButtonValid).toBeFalse();
    });
  });

  describe('Max Length Validation for Requested By', () => {
    it('should truncate input when exceeding 100 characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const longValue = 'A'.repeat(150);

      component.onRequestedByChange({
        target: { value: longValue } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy.length).toBeLessThanOrEqual(100);
      expect(component.requestedBy).toBe('A'.repeat(100));
    });

    it('should allow exactly 100 characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const exactValue = 'B'.repeat(100);

      component.onRequestedByChange({
        target: { value: exactValue } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe(exactValue);
      expect(component.requestedBy.length).toBe(100);
      expect(component.isButtonValid).toBeTrue();
    });

    it('should allow 99 characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const value = 'C'.repeat(99);

      component.onRequestedByChange({
        target: { value: value } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe(value);
      expect(component.requestedBy.length).toBe(99);
      expect(component.isButtonValid).toBeTrue();
    });

    it('should combine max length and character sanitization', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const longDirtyValue = 'user/name'.repeat(20) + ':::***???';

      component.onRequestedByChange({
        target: { value: longDirtyValue } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy.length).toBeLessThanOrEqual(100);
      expect(component.requestedBy).not.toContain('/');
      expect(component.requestedBy).not.toContain(':');
      expect(component.requestedBy).not.toContain('*');
      expect(component.requestedBy).not.toContain('?');
    });

    it('should handle max length with valid characters with spaces', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const value = 'John Doe '.repeat(15); // Will exceed 100

      component.onRequestedByChange({
        target: { value: value } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy.length).toBeLessThanOrEqual(100);
      expect(component.isButtonValid).toBeTrue();
    });

    it('should disable button when exceeding 100 chars results in empty after sanitization', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const dirtyLongValue = '/\\:*?"<>|'.repeat(20);

      component.onRequestedByChange({
        target: { value: dirtyLongValue } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy).toBe('');
      expect(component.isButtonValid).toBeFalse();
    });

    it('should not exceed 100 chars when given exactly 100 with invalid characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const value = ('user/name').repeat(13); // 117 chars with invalid chars

      component.onRequestedByChange({
        target: { value: value } as unknown as Event
      } as unknown as Event);

      expect(component.requestedBy.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Paste Event Handling for Requested By', () => {
    it('should sanitize pasted valid content', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'John Doe' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(component.requestedBy).toBe('John Doe');
      expect(component.isButtonValid).toBeTrue();
      expect(input.selectionStart).toBe(8);
      expect(input.selectionEnd).toBe(8);
    });

    it('should sanitize pasted content with invalid characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'user/name:test*' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe('usernametest');
      expect(component.requestedBy).not.toContain('/');
      expect(component.requestedBy).not.toContain(':');
      expect(component.requestedBy).not.toContain('*');
    });

    it('should enforce max length on pasted content exceeding 100 chars', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const longContent = 'A'.repeat(150);
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => longContent }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy.length).toBeLessThanOrEqual(100);
      expect(component.requestedBy).toBe('A'.repeat(100));
    });

    it('should handle pasting in the middle of existing text', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.requestedBy = 'Hello World';
      const input = createPasteInput('Hello World', 5, 5);
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => ' John' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe('Hello John World');
      expect(input.selectionStart).toBe(10);
      expect(input.selectionEnd).toBe(10);
    });

    it('should handle pasting with selection replacement', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.requestedBy = 'Hello World';
      const input = createPasteInput('Hello World', 0, 5);
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'Goodbye' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe('Goodbye World');
      expect(input.selectionStart).toBe(7);
      expect(input.selectionEnd).toBe(7);
    });

    it('should handle pasting content with mixed valid and invalid characters', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'user/name_123:test-value' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe('username_123test-value');
      expect(component.requestedBy).toContain('_');
      expect(component.requestedBy).toContain('-');
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

    it('should disable button if pasted content becomes empty after sanitization', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => '/\\:*?"<>|' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe('');
      expect(component.isButtonValid).toBeFalse();
    });

    it('should handle null clipboard data gracefully', () => {
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: null
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe('');
    });

    it('should combine max length and sanitization for pasted content', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const longDirtyContent = ('user/name').repeat(20) + ':::***???';
      const input = createPasteInput();
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => longDirtyContent }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy.length).toBeLessThanOrEqual(100);
      expect(component.requestedBy).not.toContain('/');
      expect(component.requestedBy).not.toContain(':');
      expect(component.requestedBy).not.toContain('*');
    });

    it('should only insert the remaining allowed characters when nearing max length', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const existingValue = 'A'.repeat(98);
      const input = createPasteInput(existingValue, 98, 98);
      const pasteEvent = {
        preventDefault: jasmine.createSpy(),
        target: input,
        clipboardData: { getData: () => 'BCDE' }
      } as unknown as ClipboardEvent;

      component.onRequestedByPaste(pasteEvent);

      expect(component.requestedBy).toBe(`${existingValue}BC`);
      expect(input.selectionStart).toBe(100);
      expect(input.selectionEnd).toBe(100);
    });

    it('should not call setSelectionRange when setRangeText handles caret placement', () => {
      component.selectedFile = new File(['content'], 'test.csv', { type: 'text/csv' });
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