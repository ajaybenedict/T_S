import { Component } from '@angular/core';
import { APP_ROUTE_CONFIG_URL } from '../core/constants/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent {
  constructor(
    private readonly router: Router,
  ) { }

  requestAccess() {    
    // This will redirect user to landingpage with angular router logic. No need to identify the hostname.
    this.router.navigateByUrl(`/${APP_ROUTE_CONFIG_URL.LANDING_PAGE}`);
  }
}
