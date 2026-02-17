import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-validation-error',
  templateUrl: './validation-error.component.html',
  styleUrls: ['./validation-error.component.css']
})
export class ValidationErrorComponent {

  constructor(
    private sanitizer: DomSanitizer,
  ){}

  @Input('errorMsg') _errorMsg: string = 'File size exceeds the limit. Try again';  
  @Input() width: string = '412px'; 
  @Input() height: string = '36px'; 
  @Input() imgSrc: string = '/assets/alert.svg';
  @Input() validationClass: string = 'ppc-validation-error-container';

  get sanitizedContent() {
    return this.sanitizer.bypassSecurityTrustHtml(this._errorMsg);
  }

}
