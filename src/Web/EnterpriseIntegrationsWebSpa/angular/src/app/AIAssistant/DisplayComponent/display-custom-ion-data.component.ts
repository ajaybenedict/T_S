import { Component } from '@angular/core';
import { BaseDisplayComponent } from './base-display.component';

@Component({
  selector: 'display-ion-data',
  templateUrl: './display-custom-ion-data.component.html'
})

export class DisplayCustomIonDataComponent extends BaseDisplayComponent {

  constructor() {
    super();
  }

}
