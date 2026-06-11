import { Component, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {

  @Input() errorMsg: string = '<span class="ppc-bold-txt">System Error</span> while uploading. Please <span class="ppc-bold-txt">try uploading again</span>';

  constructor(
    private sanitizer: DomSanitizer,
  ){}  

  /**
   * Sanitizes incoming rich text before binding it with [innerHTML].
   */
  getSanitizedHTML(str: string) {
    return this.sanitizer.sanitize(SecurityContext.HTML, str) ?? '';
  }
}
