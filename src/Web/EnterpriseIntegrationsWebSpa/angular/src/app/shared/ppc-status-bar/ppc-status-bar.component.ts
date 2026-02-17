import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  @Input('data') declare _data: PPCStatusBarData;
  @Output() dismissClicked = new EventEmitter<boolean>();
  
  get configData() {
    return ppcStatusBarConstants[this._data.type]
  }
  
  get sanitizedContent() {
    return this.sanitizer.bypassSecurityTrustHtml(this._data.message);
  }

  emitDismiss() {
    this.dismissClicked.emit(true);
  }
}
