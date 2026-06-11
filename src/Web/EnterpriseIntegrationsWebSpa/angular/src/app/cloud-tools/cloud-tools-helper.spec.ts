import { CloudToolsHelper } from './cloud-tools-helper';

describe('CloudToolsHelper', () => {
  describe('Filename-Safe Validation', () => {
    describe('sanitizeFilenameString', () => {
      it('should return empty string for input with only invalid characters', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('/\\:*?"<>|!@#$%^&()[]{}')).toBe('');
      });

      it('should preserve alphanumeric characters', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('User123')).toBe('User123');
        expect(CloudToolsHelper.sanitizeFilenameString('ABC')).toBe('ABC');
      });

      it('should preserve spaces', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('John Doe')).toBe('John Doe');
        expect(CloudToolsHelper.sanitizeFilenameString('user name')).toBe('user name');
      });

      it('should remove tabs and newlines while keeping normal spaces', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('John\tDoe')).toBe('JohnDoe');
        expect(CloudToolsHelper.sanitizeFilenameString('John\nDoe')).toBe('JohnDoe');
        expect(CloudToolsHelper.sanitizeFilenameString('John Doe')).toBe('John Doe');
      });

      it('should preserve hyphens', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('user-name')).toBe('user-name');
      });

      it('should preserve underscores', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('user_name')).toBe('user_name');
      });

      it('should remove all other special characters', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('user@name!')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user^&%name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user,name.')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user/name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user\\name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user:name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user*name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user?name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user"name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user<name>')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('user|name')).toBe('username');
      });

      it('should handle complex inputs with multiple invalid characters', () => {
        expect(CloudToolsHelper.sanitizeFilenameString('user/\\:*?"<>|name')).toBe('username');
        expect(CloudToolsHelper.sanitizeFilenameString('John/Doe:Smith*Test?Name')).toBe('JohnDoeSmithTestName');
        expect(CloudToolsHelper.sanitizeFilenameString('John Doe-Smith_123?Test!@#')).toBe('John Doe-Smith_123Test');
      });
    });
  });
});
