import { Injectable } from '@angular/core';
import { APP_ROUTE_CONFIG_URL } from '../constants/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { SsoService } from './sso.service';
import { PermissionsLoaderDialogService } from './permissions-loader-dialog.service';
import { Router } from '@angular/router';
import { DataState } from './data-state';

@Injectable({
  providedIn: 'root'
})
export class SsoLoginService {

  constructor(
    private readonly ssoService: SsoService,
    private readonly dialogSVC: PermissionsLoaderDialogService,
    private readonly router: Router,
    private readonly dataState: DataState,
  ) { }

  public handleSsoSuccess(res: any): void {
    if (!res) {
      // No response - treat as error case
      this.ssoService.redirectToError();
      // For local, uncomment this line - sessionStorage.setItem('jwtToken', res?.authJwtToken);
      return;
    }

    if (res.authJwtToken) {
      this.processSuccessfulLogin(res);
      return;
    }

    // Auth response without token - redirect to SSO login
    this.ssoService.redirectToSSOLogin();
  }

  private processSuccessfulLogin(res: any): void {
    // for local, uncomment this line - sessionStorage.setItem('jwtToken', res.authJwtToken);    
    this.dataState.setFirstName(res.firstName);
    this.dataState.setUserEmail(res.emailAddress);
    localStorage.setItem('firstName', res.firstName);
    localStorage.setItem('redirectUrl', res.redirectUrl);
    this.dataState.setRedirectUrl(res.redirectUrl);
    
    // This will redirect user to landingpage with angular router logic. No need to identify the hostname.
    this.router.navigateByUrl(`/${APP_ROUTE_CONFIG_URL.LANDING_PAGE}`);
  }

  public handleSsoError(error: HttpErrorResponse): void {
    const status = error?.status;

    switch (status) {
      case 401:
        // Microsoft login ok, but user not onboarded
        this.dialogSVC.showDialog('UserNotFound');
        break;

      case 403:
        // Microsoft login ok, but user deactivated
        this.dialogSVC.showDialog('UserDeactivated');
        break;

      case 410:
        // Session expired
        this.dialogSVC.showDialog('SessionExpired');
        break;

      default:
        // Fallback - generic SSO error
        this.ssoService.redirectToError();
        break;
    }
  }
}
