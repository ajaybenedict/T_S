import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface EmailValidationOptions {
  allowMultipleEmails?: boolean;
  allowedDomains?: readonly string[] | null;
}

/**
 * Validates one or more email addresses with optional domain restrictions.
 * Empty values are ignored so required checks can be composed separately.
 */
export function emailFormatAndDomainValidator(options?: EmailValidationOptions): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    const allowMultipleEmails = !!options?.allowMultipleEmails;
    const allowedDomains = (options?.allowedDomains ?? [])
      .map((domain: string) => domain.toLowerCase())
      .filter((domain: string) => !!domain);

    // Allow empty values (required validator handles this)
    if (!value) {
      return null;
    }

    const rawEmails = value
      .split(/[\s,;]+/)
      .map((email: string) => email.trim())
      .filter((email: string) => !!email);

    if (rawEmails.length === 0) {
      return { invalidEmailFormat: { value } };
    }

    if (!allowMultipleEmails && rawEmails.length > 1) {
      return { multipleEmails: { value } };
    }

    // Validate email format using a simplified RFC 5322 pattern.
    // The domain label before the last dot excludes '.' to prevent ReDoS via backtracking.
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
    const invalidEmail = rawEmails.find((email: string) => !emailRegex.test(email));
    if (invalidEmail) {
      return { invalidEmailFormat: { value: invalidEmail } };
    }

    if (!allowedDomains.length) {
      return null;
    }

    const invalidDomains = rawEmails
      .map((email: string) => email.split('@')[1]?.toLowerCase() ?? '')
      .filter((domain: string) => !allowedDomains.includes(domain));

    if (invalidDomains.length) {
      return {
        invalidDomain: {
          value,
          invalidDomains,
          allowedDomains: options?.allowedDomains ?? [],
        },
      };
    }

    return null;
  };
}