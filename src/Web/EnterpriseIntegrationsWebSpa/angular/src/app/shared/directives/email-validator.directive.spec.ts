import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { EmailValidatorDirective } from './email-validator.directive';

@Component({
  template: `
    <form [formGroup]="form">
      <input
        id="reactiveEmail"
        appEmailValidator
        [emailValidatorMode]="reactiveMode"
        [emailValidatorAllowMultiple]="reactiveAllowMultiple"
        [emailValidatorAllowedDomains]="reactiveAllowedDomains"
        formControlName="email" />
    </form>

    <input
      id="standaloneEmail"
      appEmailValidator
      [emailValidatorMode]="standaloneMode"
      [emailValidatorAllowMultiple]="standaloneAllowMultiple"
      [emailValidatorAllowedDomains]="standaloneAllowedDomains" />
  `,
})
class TestHostComponent {
  form = new FormGroup({
    email: new FormControl(''),
  });

  reactiveMode: 'validateWithForm' | 'standalone' = 'validateWithForm';
  reactiveAllowMultiple = false;
  reactiveAllowedDomains: readonly string[] | null = ['techdata.com', 'tdsynnex.com'];

  standaloneMode: 'validateWithForm' | 'standalone' = 'standalone';
  standaloneAllowMultiple = false;
  standaloneAllowedDomains: readonly string[] | null = ['techdata.com', 'tdsynnex.com'];
}

describe('EmailValidatorDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, EmailValidatorDirective],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getReactiveControl(): FormControl {
    return host.form.get('email') as FormControl;
  }

  function getStandaloneInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#standaloneEmail') as HTMLInputElement;
  }

  it('should create directive instances for both inputs', () => {
    const directives = fixture.debugElement.queryAll(By.directive(EmailValidatorDirective));
    expect(directives.length).toBe(2);
  });

  it('should validate reactive form value as valid for allowed single email', () => {
    const control = getReactiveControl();
    control.setValue('valid@techdata.com');
    control.updateValueAndValidity();

    expect(control.errors).toBeNull();
  });

  it('should set multipleEmails error in reactive mode when multiple emails are not allowed', () => {
    const control = getReactiveControl();
    control.setValue('one@techdata.com, two@techdata.com');
    control.updateValueAndValidity();

    expect(control.errors).toEqual({
      multipleEmails: { value: 'one@techdata.com, two@techdata.com' },
    });
  });

  it('should allow multiple emails in reactive mode when enabled', () => {
    host.reactiveAllowMultiple = true;
    fixture.detectChanges();

    const control = getReactiveControl();
    control.setValue('one@techdata.com;two@tdsynnex.com');
    control.updateValueAndValidity();

    expect(control.errors).toBeNull();
  });

  it('should revalidate reactive control when allowMultiple input changes', () => {
    const control = getReactiveControl();
    control.setValue('one@techdata.com two@tdsynnex.com');
    control.updateValueAndValidity();
    expect(control.errors?.['multipleEmails']).toBeTruthy();

    host.reactiveAllowMultiple = true;
    fixture.detectChanges();
    control.updateValueAndValidity();

    expect(control.errors).toBeNull();
  });

  it('should skip reactive form errors when mode is standalone', () => {
    host.reactiveMode = 'standalone';
    fixture.detectChanges();

    const control = getReactiveControl();
    control.setValue('not-an-email');
    control.updateValueAndValidity();

    expect(control.errors).toBeNull();
  });

  it('should set invalidDomain error in reactive mode when domain is not allowed', () => {
    const control = getReactiveControl();
    control.setValue('user@notallowed.com');
    control.updateValueAndValidity();

    expect(control.errors?.['invalidDomain']?.allowedDomains).toEqual(['techdata.com', 'tdsynnex.com']);
  });

  it('should skip domain validation in reactive mode when allowed domains are empty', () => {
    host.reactiveAllowedDomains = [];
    fixture.detectChanges();

    const control = getReactiveControl();
    control.setValue('user@any-domain.com');
    control.updateValueAndValidity();

    expect(control.errors).toBeNull();
  });

  it('should revalidate when reactive allowed domains input changes', () => {
    const control = getReactiveControl();

    control.setValue('user@mynewdomain.com');
    control.updateValueAndValidity();
    expect(control.errors?.['invalidDomain']).toBeTruthy();

    host.reactiveAllowedDomains = ['mynewdomain.com'];
    fixture.detectChanges();
    control.updateValueAndValidity();

    expect(control.errors).toBeNull();
  });

  it('should set custom validity message in standalone mode for invalid format', () => {
    const input = getStandaloneInput();
    input.value = 'invalid-email';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.validationMessage).toContain('valid email format');
  });

  it('should clear custom validity message in standalone mode for valid email', () => {
    const input = getStandaloneInput();

    input.value = 'invalid-email';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input.validationMessage).not.toBe('');

    input.value = 'user@techdata.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.validationMessage).toBe('');
  });

  it('should call reportValidity on blur in standalone mode', () => {
    const input = getStandaloneInput();
    const reportValiditySpy = spyOn(input, 'reportValidity').and.returnValue(false);

    input.value = 'invalid-email';
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(reportValiditySpy).toHaveBeenCalled();
  });

  it('should set standalone custom validity for multiple emails when not allowed', () => {
    const input = getStandaloneInput();

    input.value = 'one@techdata.com, two@techdata.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.validationMessage).toContain('Only one email address is allowed');
  });

  it('should bypass standalone domain validation when allowed domains are empty', () => {
    host.standaloneAllowedDomains = [];
    fixture.detectChanges();

    const input = getStandaloneInput();
    input.value = 'user@unknown-domain.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.validationMessage).toBe('');
  });

  it('should clear standalone custom validity when mode switches to validateWithForm', () => {
    const input = getStandaloneInput();

    input.value = 'invalid-email';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input.validationMessage).not.toBe('');

    host.standaloneMode = 'validateWithForm';
    fixture.detectChanges();

    expect(input.validationMessage).toBe('');
  });
});
