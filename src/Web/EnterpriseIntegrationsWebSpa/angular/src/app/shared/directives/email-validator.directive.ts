import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { EmailValidationOptions, emailFormatAndDomainValidator } from './validators/email.validator';

type EmailValidationMode = 'validateWithForm' | 'standalone';

@Directive({
  selector: '[appEmailValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: EmailValidatorDirective,
      multi: true,
    },
  ],
})
export class EmailValidatorDirective implements Validator, OnChanges {
  @Input() emailValidatorAllowMultiple = false;
  @Input() emailValidatorAllowedDomains: readonly string[] | null = null;
  @Input() emailValidatorMode: EmailValidationMode = 'validateWithForm';

  private onValidatorChange?: () => void;

  constructor(private readonly elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>) {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.getMode() === 'standalone') {
      return null;
    }

    const options: EmailValidationOptions = {
      allowMultipleEmails: this.toBoolean(this.emailValidatorAllowMultiple),
      allowedDomains: this.emailValidatorAllowedDomains,
    };

    return emailFormatAndDomainValidator(options)(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.getMode() === 'standalone') {
      this.applyStandaloneValidation(this.elementRef.nativeElement.value);
    } else {
      this.elementRef.nativeElement.setCustomValidity('');
    }

    if (this.onValidatorChange) {
      this.onValidatorChange();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    if (this.getMode() === 'standalone') {
      this.applyStandaloneValidation(this.getInputValue(event));
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    if (this.getMode() === 'standalone') {
      this.applyStandaloneValidation(this.getInputValue(event), true);
    }
  }

  private applyStandaloneValidation(value: string, report = false): void {
    const options: EmailValidationOptions = {
      allowMultipleEmails: this.toBoolean(this.emailValidatorAllowMultiple),
      allowedDomains: this.emailValidatorAllowedDomains,
    };

    const errors = emailFormatAndDomainValidator(options)({ value } as AbstractControl);
    this.elementRef.nativeElement.setCustomValidity(this.getErrorMessage(errors));

    if (report) {
      this.elementRef.nativeElement.reportValidity();
    }
  }

  private getErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    if (errors['multipleEmails']) {
      return 'Only one email address is allowed.';
    }

    if (errors['invalidEmailFormat']) {
      return 'Please provide a valid email format (e.g., user@domain.com).';
    }

    if (errors['invalidDomain']) {
      const allowedDomains = errors['invalidDomain']?.allowedDomains;
      if (Array.isArray(allowedDomains) && allowedDomains.length) {
        return `Email domain must be one of: ${allowedDomains.join(', ')}.`;
      }

      return 'Email domain is not allowed.';
    }

    return 'Invalid email address.';
  }

  private getMode(): EmailValidationMode {
    return this.emailValidatorMode === 'standalone' ? 'standalone' : 'validateWithForm';
  }

  private getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    return target?.value ?? '';
  }

  private toBoolean(value: unknown): boolean {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return !!value;
  }
}