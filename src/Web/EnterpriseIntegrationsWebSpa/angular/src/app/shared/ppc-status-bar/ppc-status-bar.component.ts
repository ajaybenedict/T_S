import { Component, EventEmitter, Input, Output, SecurityContext } from '@angular/core';
import { PPCStatusBarData } from 'src/app/models/ppc-status-bar.model';
import { ppcStatusBarConstants } from './ppc-status-bar.constant';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ppc-status-bar',
  templateUrl: './ppc-status-bar.component.html',
  styleUrls: ['./ppc-status-bar.component.css']
})
export class PpcStatusBarComponent {

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  @Input() data!: PPCStatusBarData;
  @Output() dismissClicked = new EventEmitter<boolean>();
  
  get configData() {
    return ppcStatusBarConstants[this.data.type]
  }
  
  /**
   * Sanitizes status message HTML to prevent execution of injected markup.
   */
  get sanitizedContent() {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.data.message) ?? '';
  }

  emitDismiss() {
    this.dismissClicked.emit(true);
  }
}
