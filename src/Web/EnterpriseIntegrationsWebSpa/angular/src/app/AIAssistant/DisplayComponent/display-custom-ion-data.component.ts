import { Component, Input } from '@angular/core';
import { BaseDisplayComponent } from './base-display.component';
import { PageEvent } from '@angular/material/paginator';
@Component({
  selector: 'display-ion-data',
  templateUrl: './display-custom-ion-data.component.html'
})
export class DisplayCustomIonDataComponent extends BaseDisplayComponent {
  
  constructor() {

    super();

  }
  ngOnInit() {
  }



}
