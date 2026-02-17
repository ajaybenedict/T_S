import {
  Directive,
  Input,
  HostListener,
  forwardRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { InputFilterMode } from 'src/app/models/input-filter.model';

@Directive({
  selector: '[appInputFilter]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputFilterDirective),
      multi: true,
    },
  ],
})
export class InputFilterDirective implements Validator, OnChanges {
  /** Choose one of the modes in the template:
   *  <input appInputFilter="numeric" …>
   */
  @Input('appInputFilter') mode: InputFilterMode = 'alphanumeric';

  /** Regexes for each mode */
  private readonly patterns: Record<InputFilterMode, RegExp> = {
    numeric: /^\d*$/,
    decimal: /^\d*\.?\d*$/,    // digits with optional single dot
    alpha: /^[A-Za-z]*$/,
    alphanumeric: /^[A-Za-z\d]*$/,
    emailchars: /^[A-Za-z\d.@]*$/,
    alphanumerichyphen: /^[A-Za-z\d-]*$/, // to support reseller ID with alphabets, numeric, hyphen
  };

  private currentPattern!: RegExp;

  /* ------------------ Validator API ------------------ */
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (value == null || value === '') {
      return null;
    }
    return this.currentPattern.test(value)
      ? null
      : { appInputFilter: { mode: this.mode } };
  }

  registerOnValidatorChange?(fn: () => void): void {
    this.onChange = fn;
  }

  /* ------------------ React to @Input changes ------------------ */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode']) {
      this.currentPattern = this.patterns[this.mode];
      this.onChange(); // tell Angular to re‑run validation
    }
  }

  /* ------------------ UX: block illegal characters early ------------------ */
  @HostListener('keydown', ['$event'])
  onKeydown(evt: KeyboardEvent): void {
    if (this.isModifierOrNav(evt)) {
      return;
    }

    const target = evt.target as HTMLInputElement;
    if (this.isDisallowed(evt.key, target.value)) {
      evt.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(evt: ClipboardEvent): void {
    const paste = evt.clipboardData?.getData('text') ?? '';
    const sanitized = this.sanitize(paste);
    // Insert sanitized content manually
    evt.preventDefault();
    const target = evt.target as HTMLInputElement;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;

    const newValue =
      target.value.slice(0, start) + sanitized + target.value.slice(end);

    target.value = newValue;

    // Trigger input event so Angular form control updates
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* ------------------ private ------------------ */
  private isModifierOrNav(evt: KeyboardEvent): boolean {
    // Ctrl/Cmd shortcuts OR any multi‑char key (e.g. ArrowLeft, F1, etc.)
    return evt.ctrlKey || evt.metaKey || evt.key.length > 1;
  }

  private isDisallowed(key: string, currentValue: string = ''): boolean {
    if (this.mode === 'decimal') {
      if (!/^[0-9.]$/.test(key)) {
        return true; // not a digit or dot
      }
      if (key === '.' && currentValue.includes('.')) {
        return true; // already has a dot
      }
      return false;
    }

    if (this.mode === 'numeric') {
      return !/^\d$/.test(key);
    }

    return !this.currentPattern.test(key);
  }


  private onChange: () => void = () => { };

  private sanitize(input: string): string {
    switch (this.mode) {
      case 'numeric':
        return input.replace(/\D/g, '');
      case 'decimal':
        return input
          .replace(/[^0-9.]/g, '')   // allow digits and dots only
          .replace(/(\..*?)\./g, '$1'); // remove all dots after the first
      case 'alpha':
        return input.replace(/[^A-Za-z]/g, '');
      case 'alphanumeric':
        return input.replace(/[^A-Za-z\d]/g, '');
      case 'emailchars':
        return input.replace(/[^A-Za-z\d.@]/g, '');
      case 'alphanumerichyphen':
        return input.replaceAll(/[^A-Za-z\d-]/g, '');
      default:
        return input;
    }
  }
}
