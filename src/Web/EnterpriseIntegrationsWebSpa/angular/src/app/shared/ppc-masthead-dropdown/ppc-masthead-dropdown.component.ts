import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PPCMastheadDropdown, PPCMastheadDropdownCategory, PPCMastheadDropdownPanel } from 'src/app/models/ppc-masthead-dropdown.model';

@Component({
  selector: 'app-ppc-masthead-dropdown',
  templateUrl: './ppc-masthead-dropdown.component.html',
  styleUrls: ['./ppc-masthead-dropdown.component.css']
})
export class PpcMastheadDropdownComponent implements PPCMastheadDropdownPanel{

  @Input() declare configList: PPCMastheadDropdown[];
  @Input() declare currentURL: string;

  @ViewChild(TemplateRef) declare templateRef: TemplateRef<any>;
  @Output() closed = new EventEmitter<void>();

  enumCategory = PPCMastheadDropdownCategory;
  categories: string[] = Object.values(this.enumCategory);
   
  constructor(
    private readonly router: Router,
  ){}

  onClickHandler(config: PPCMastheadDropdown) {  
    this.closed.emit();
    if(config.navigationURL && config.navigationURL != '') {
      this.router.navigateByUrl(config.navigationURL);
    } else {
      console.log('PPCMastheadDropdown - NavigationURL not defined');
    }
  }

  isActiveRoute(config: PPCMastheadDropdown) {
    if(config.navigationURL) {
      return this.currentURL === config.navigationURL;
    } else {
      return false;
    }
  }

  checkCategoryAvailability(category: string) {
    return this.configList.some(el => el.category == category && el.isEnabled);
  }
}
