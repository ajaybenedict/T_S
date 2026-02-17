import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ppc-api-results-header',
  templateUrl: './ppc-api-results-header.component.html',
  styleUrls: ['./ppc-api-results-header.component.css']
})
export class PpcApiResultsHeaderComponent implements OnInit{
  @Input('successCount') _successCount: number = 0;
  @Input('errorCount') _errorCount: number = 0;
  declare message: string;

  constructor(
    private sanitizer: DomSanitizer,
  ){}

  ngOnInit(): void {
    this.message = `<span class="ppc-bold-txt"> ${this._successCount} successfully </span>&nbsp;uploaded and&nbsp;<span class="ppc-bold-txt"> ${this._errorCount} errors </span>&nbsp;found in upload.`
  }

  getSanitizedHTML(str: string) {
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }
}
