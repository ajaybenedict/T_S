import { Injectable } from '@angular/core';
import { APP_ROUTE_CONFIG_URL } from '../constants/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { SsoService } from './sso.service';
import { PermissionsLoaderDialogService } from './permissions-loader-dialog.service';
import { Router } from '@angular/router';
import { DataState } from './data-state';
import { User, UserResponse } from 'src/app/models/user.model';

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

  public handleSsoSuccess(res: UserResponse | null | undefined): void {
    if (!res) {
      // No response - treat as error case
      this.ssoService.redirectToError();
      return;
    }

    if (res.authJwtToken) {
      this.processSuccessfulLogin(res);
      return;
    }

    // Auth response without token - redirect to SSO login
    this.ssoService.redirectToSSOLogin();
  }

  private processSuccessfulLogin(res: UserResponse): void {
    // for local, uncomment the line -----
    /* if (res.authJwtToken) {
      sessionStorage.setItem('jwtToken', res.authJwtToken);
    } */
    // ----- for local, uncomment the line above -----
    const user = new User({
      firstName: res.firstName ?? '',
      lastName: res.lastName ?? '',
      emailAddress: res.emailAddress ?? '',
      userKey: res.userKey ?? '',
    });

    this.dataState.setUser(user);    
    this.dataState.setRedirectUrl(res.redirectUrl ?? null);
    
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

      case 500:
        // Server error - show generic error dialog
        this.dialogSVC.showDialog('ServerError');
        break;

      default:
        // Fallback - generic SSO error
        this.ssoService.redirectToError();
        break;
    }
  }
}
