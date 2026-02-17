import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {

  @Input('errorMsg') _errorMsg: string = '<span class="ppc-bold-txt">System Error</span> while uploading. Please <span class="ppc-bold-txt">try uploading again</span>';

  constructor(
    private sanitizer: DomSanitizer,
  ){}  

  getSanitizedHTML(str: string) {
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }
}
