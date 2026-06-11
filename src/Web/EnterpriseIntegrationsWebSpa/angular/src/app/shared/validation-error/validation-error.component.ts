import { Component, Input } from '@angular/core';

export type ValidationErrorVariant = 'error' | 'warning';

@Component({
  selector: 'app-validation-error',
  templateUrl: './validation-error.component.html',
  styleUrls: ['./validation-error.component.css']
})
export class ValidationErrorComponent {

  @Input() errorMsg = 'File size exceeds the limit. Try again';
  @Input() width = '412px';
  @Input() height = '36px';
  @Input() variant: ValidationErrorVariant = 'error';

  get containerClasses(): string[] {
    return ['validation-error-container', `validation-error--${this.variant}`];
  }

  get iconSrc(): string {
    switch (this.variant) {
      case 'warning':
        return '/assets/alert_orange_24_24.svg';
      case 'error':
      default:
        return '/assets/validation_alert_icon_24_24.svg';
    }
  }
}
