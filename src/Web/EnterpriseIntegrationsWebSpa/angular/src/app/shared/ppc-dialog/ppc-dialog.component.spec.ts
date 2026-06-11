import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PpcDialogComponent } from './ppc-dialog.component';

describe('PpcConfirmDialogComponent', () => {
  let component: PpcDialogComponent;
  let fixture: ComponentFixture<PpcDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PpcDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ PpcDialogComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            type: 'Confirmation',
            content: '<span class="safe">Confirm</span><img src="x" onerror="alert(1)">',
          },
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sanitize dialog html content', () => {
    const sanitized = component.getSanitizedContent('<span class="safe">Confirm</span><img src="x" onerror="alert(1)">');

    expect(sanitized).toContain('<span class="safe">Confirm</span>');
    expect(sanitized).not.toContain('onerror');
  });

  it('should close dialog when emitTrue is called', () => {
    component.emitTrue();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should disable primary action when service id is required and empty', () => {
    component.selectedRERadio = 'With_Service_Id';
    component.serviceOrderId = '   ';

    expect(component.isPrimaryDisabled()).toBeTrue();
  });

  it('should enable primary action when selection does not require service id', () => {
    component.selectedRERadio = 'Without_Service_Id';
    component.serviceOrderId = '';

    expect(component.isPrimaryDisabled()).toBeFalse();
  });
});
