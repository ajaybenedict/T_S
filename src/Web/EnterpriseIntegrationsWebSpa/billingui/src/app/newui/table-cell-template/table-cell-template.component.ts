import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import { DataTableService } from 'src/app/services/data-table.service';

@Component({
  selector: 'app-table-cell-template',
  templateUrl: './table-cell-template.component.html'
})
export class TableCellTemplateComponent implements AfterViewInit {

  @ViewChild('invoice', { static: true }) invoice!: TemplateRef<any>;
  @ViewChild('issueCount', { static: true }) issueCount!: TemplateRef<any>;
  @ViewChild('orderDetails', { static: true }) orderDetails!: TemplateRef<any>;
  @ViewChild('greyTextFormat', { static: true }) greyTextFormat!: TemplateRef<any>;  
  @ViewChild('countryformat', { static: true }) countryformat!: TemplateRef<any>;
  @ViewChild('resellerdetails', { static: true }) resellerdetails!: TemplateRef<any>;

  constructor(private readonly dtService: DataTableService) {}

  ngAfterViewInit() {

    this.dtService.setTemplates({
      invoice: this.invoice,
      issueCount: this.issueCount,
      orderDetails: this.orderDetails,
      greyTextFormat: this.greyTextFormat,
      countryformat: this.countryformat,
      resellerdetails:this.resellerdetails
    });

  }
}