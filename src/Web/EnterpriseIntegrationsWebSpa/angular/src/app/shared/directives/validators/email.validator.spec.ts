import { FormControl } from '@angular/forms';
import { emailFormatAndDomainValidator } from './email.validator';

describe('emailFormatAndDomainValidator', () => {
  it('should return null for empty value so required can handle emptiness', () => {
    const control = new FormControl('');
    const validator = emailFormatAndDomainValidator();

    expect(validator(control)).toBeNull();
  });

  it('should validate a single email when domain list is empty', () => {
    const control = new FormControl('user@anydomain.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: false,
      allowedDomains: [],
    });

    expect(validator(control)).toBeNull();
  });

  it('should validate a single email when domain list is null', () => {
    const control = new FormControl('user@anydomain.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: false,
      allowedDomains: null,
    });

    expect(validator(control)).toBeNull();
  });

  it('should fail invalid email format', () => {
    const control = new FormControl('invalid-email');
    const validator = emailFormatAndDomainValidator();

    expect(validator(control)).toEqual({ invalidEmailFormat: { value: 'invalid-email' } });
  });

  it('should fail when multiple emails are provided and multiple emails are not allowed', () => {
    const control = new FormControl('one@techdata.com,two@techdata.com');
    const validator = emailFormatAndDomainValidator({ allowMultipleEmails: false });

    expect(validator(control)).toEqual({ multipleEmails: { value: 'one@techdata.com,two@techdata.com' } });
  });

  it('should default to single-email mode when allowMultipleEmails is not provided', () => {
    const control = new FormControl('one@techdata.com two@techdata.com');
    const validator = emailFormatAndDomainValidator();

    expect(validator(control)).toEqual({ multipleEmails: { value: 'one@techdata.com two@techdata.com' } });
  });

  it('should pass when multiple emails are provided and multiple emails are allowed', () => {
    const control = new FormControl('one@techdata.com; two@tdsynnex.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: true,
      allowedDomains: ['techdata.com', 'tdsynnex.com'],
    });

    expect(validator(control)).toBeNull();
  });

  it('should fail invalid email in multi-email mode when any token has invalid format', () => {
    const control = new FormControl('one@techdata.com;not-an-email');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: true,
      allowedDomains: ['techdata.com'],
    });

    expect(validator(control)).toEqual({ invalidEmailFormat: { value: 'not-an-email' } });
  });

  it('should fail when one or more email domains are not in the allowed list', () => {
    const control = new FormControl('one@techdata.com two@notallowed.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: true,
      allowedDomains: ['techdata.com'],
    });

    expect(validator(control)).toEqual({
      invalidDomain: {
        value: 'one@techdata.com two@notallowed.com',
        invalidDomains: ['notallowed.com'],
        allowedDomains: ['techdata.com'],
      },
    });
  });

  it('should treat domain checks as case-insensitive', () => {
    const control = new FormControl('User@MyTecD.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: false,
      allowedDomains: ['mytecd.com'],
    });

    expect(validator(control)).toBeNull();
  });

  it('should allow dots in local-part for allowed domain', () => {
    const control = new FormControl('a.b@techdata.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: false,
      allowedDomains: ['techdata.com'],
    });

    expect(validator(control)).toBeNull();
  });

  it('should reject subdomain when only parent domain is allowed', () => {
    const control = new FormControl('user@a.techdata.com');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: false,
      allowedDomains: ['techdata.com'],
    });

    expect(validator(control)).toEqual({
      invalidDomain: {
        value: 'user@a.techdata.com',
        invalidDomains: ['a.techdata.com'],
        allowedDomains: ['techdata.com'],
      },
    });
  });

  it('should trim leading and trailing spaces before validation', () => {
    const control = new FormControl('  user@techdata.com  ');
    const validator = emailFormatAndDomainValidator({
      allowMultipleEmails: false,
      allowedDomains: ['techdata.com'],
    });

    expect(validator(control)).toBeNull();
  });

  it('should fail when value contains only separators and no email', () => {
    const control = new FormControl(',,,');
    const validator = emailFormatAndDomainValidator({ allowMultipleEmails: true });

    expect(validator(control)).toEqual({ invalidEmailFormat: { value: ',,,' } });
  });
});
