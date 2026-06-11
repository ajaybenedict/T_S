import { SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputFilterDirective } from './input-filter.directive';

describe('InputFilterDirective', () => {
  let directive: InputFilterDirective;

  function createPasteEvent(input: HTMLInputElement, pastedText: string): ClipboardEvent {
    return {
      clipboardData: { getData: () => pastedText },
      preventDefault: jasmine.createSpy('preventDefault'),
      target: input,
    } as unknown as ClipboardEvent;
  }

  function setMode(mode: 'numeric' | 'decimal' | 'alpha' | 'alphanumeric' | 'emailchars' | 'alphanumerichyphen'): void {
    directive.mode = mode;
    directive.ngOnChanges({
      mode: new SimpleChange(undefined, mode, true),
    });
  }

  beforeEach(() => {
    directive = new InputFilterDirective();
    setMode('decimal');
  });

  describe('decimal validation behavior', () => {
    it('accepts decimal formats that were previously valid', () => {
      const validValues = ['', '123', '123.', '123.45', '.45', '0', '0.0'];

      for (const value of validValues) {
        const result = directive.validate(new FormControl(value));
        expect(result).withContext(`Expected "${value}" to be valid`).toBeNull();
      }
    });

    it('rejects decimal formats that were previously invalid', () => {
      const invalidValues = ['.', '1..2', '..2', '12.3.4', '12a', '1-2'];

      for (const value of invalidValues) {
        const result = directive.validate(new FormControl(value));
        expect(result).withContext(`Expected "${value}" to be invalid`).toEqual({
          appInputFilter: { mode: 'decimal' },
        });
      }
    });
  });

  it('keeps empty values valid for non-decimal modes so optional fields are unaffected', () => {
    setMode('numeric');

    expect(directive.validate(new FormControl(''))).toBeNull();
  });

  describe('decimal keydown filtering', () => {
    it('prevents non-numeric and non-dot characters', () => {
      const input = document.createElement('input');
      input.value = '12';

      const event = {
        key: 'a',
        ctrlKey: false,
        metaKey: false,
        target: input,
        preventDefault: jasmine.createSpy('preventDefault'),
      } as unknown as KeyboardEvent;

      directive.onKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('prevents entering a second dot', () => {
      const input = document.createElement('input');
      input.value = '12.3';

      const event = {
        key: '.',
        ctrlKey: false,
        metaKey: false,
        target: input,
        preventDefault: jasmine.createSpy('preventDefault'),
      } as unknown as KeyboardEvent;

      directive.onKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('allows digits and first dot', () => {
      const input = document.createElement('input');
      input.value = '12';

      const digitEvent = {
        key: '3',
        ctrlKey: false,
        metaKey: false,
        target: input,
        preventDefault: jasmine.createSpy('digitPreventDefault'),
      } as unknown as KeyboardEvent;

      directive.onKeydown(digitEvent);

      const dotEvent = {
        key: '.',
        ctrlKey: false,
        metaKey: false,
        target: input,
        preventDefault: jasmine.createSpy('dotPreventDefault'),
      } as unknown as KeyboardEvent;

      directive.onKeydown(dotEvent);

      expect(digitEvent.preventDefault).not.toHaveBeenCalled();
      expect(dotEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('decimal paste sanitization', () => {
    it('keeps only digits and a single dot on paste', () => {
      const input = document.createElement('input');
      input.value = '';
      input.selectionStart = 0;
      input.selectionEnd = 0;

      const pasteEvent = {
        clipboardData: { getData: () => '12..a3.4x' },
        preventDefault: jasmine.createSpy('preventDefault'),
        target: input,
      } as unknown as ClipboardEvent;

      directive.onPaste(pasteEvent);

      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(input.value).toBe('12.34');
    });

    it('replaces selected range with sanitized pasted value', () => {
      const input = document.createElement('input');
      input.value = '99.88';
      input.selectionStart = 0;
      input.selectionEnd = 2;

      const pasteEvent = {
        clipboardData: { getData: () => '1..2a' },
        preventDefault: jasmine.createSpy('preventDefault'),
        target: input,
      } as unknown as ClipboardEvent;

      directive.onPaste(pasteEvent);

      expect(input.value).toBe('1.2.88');
    });

    it('preserves a leading dot and strips every additional dot', () => {
      const input = document.createElement('input');
      input.value = '';
      input.selectionStart = 0;
      input.selectionEnd = 0;

      const pasteEvent = {
        clipboardData: { getData: () => '..1.2.3' },
        preventDefault: jasmine.createSpy('preventDefault'),
        target: input,
      } as unknown as ClipboardEvent;

      directive.onPaste(pasteEvent);

      expect(input.value).toBe('.123');
    });

    it('returns digits only when pasted decimal text has no dot', () => {
      const input = document.createElement('input');
      input.value = '';
      input.selectionStart = 0;
      input.selectionEnd = 0;

      const pasteEvent = {
        clipboardData: { getData: () => 'a1b2c3' },
        preventDefault: jasmine.createSpy('preventDefault'),
        target: input,
      } as unknown as ClipboardEvent;

      directive.onPaste(pasteEvent);

      expect(input.value).toBe('123');
    });
  });

  describe('non-decimal paste sanitization', () => {
    it('sanitizes pasted values for all supported non-decimal modes', () => {
      const cases: Array<{
        mode: 'numeric' | 'alpha' | 'alphanumeric' | 'emailchars' | 'alphanumerichyphen';
        pasted: string;
        expected: string;
      }> = [
        { mode: 'numeric', pasted: 'a1b2c3', expected: '123' },
        { mode: 'alpha', pasted: 'A1-b C2', expected: 'AbC' },
        { mode: 'alphanumeric', pasted: 'A1-@b C2', expected: 'A1bC2' },
        { mode: 'emailchars', pasted: 'A+1.b@x-y_z', expected: 'A1.b@xyz' },
        { mode: 'alphanumerichyphen', pasted: 'A_1-b@C', expected: 'A1-bC' },
      ];

      for (const testCase of cases) {
        setMode(testCase.mode);
        const input = document.createElement('input');
        input.value = '';
        input.selectionStart = 0;
        input.selectionEnd = 0;
        const pasteEvent = createPasteEvent(input, testCase.pasted);

        directive.onPaste(pasteEvent);

        expect(input.value)
          .withContext(`Expected mode ${testCase.mode} to sanitize "${testCase.pasted}"`)
          .toBe(testCase.expected);
        expect(pasteEvent.preventDefault).toHaveBeenCalled();
      }
    });
  });
});
