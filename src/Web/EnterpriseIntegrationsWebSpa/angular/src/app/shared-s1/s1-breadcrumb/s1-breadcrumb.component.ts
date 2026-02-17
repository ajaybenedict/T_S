import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-s1-breadcrumb',
  templateUrl: './s1-breadcrumb.component.html',
  styleUrls: ['./s1-breadcrumb.component.css']
})
export class S1BreadcrumbComponent implements OnChanges {
  @Input() inputData!: string; // Expected Input - Nav1$Nav2$Nav3...

  declare crumbList: string[];
  upperBound = 0;

  ngOnChanges(): void {        
    if(this.inputData?.split('$').length > 0) {
      this.crumbList = this.inputData?.split('$');
      this.upperBound = this.crumbList.length - 1;      
    }
  }
}
