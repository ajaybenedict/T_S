import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, UrlSegment } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { SsoService } from '../services/sso.service';
import { PermissionsLoaderDialogService } from '../services/permissions-loader-dialog.service';
import { INSIGHTS_DASHBOARD_PERMISSIONS, PermissionsEnum } from '../config/permissions.config';
import { DataState } from '../services/data-state';
import { APP_ROUTE_CONFIG_URL, INSIGHT_NO_PERMISSION_REPORTS, ROUTE_DATA_KEYS } from '../constants/constants';
import { DialogType } from 'src/app/models/ppc-dialog-data.model';

@Injectable({
  providedIn: 'root'
})
export class SsoauthGuard implements CanActivate, CanMatch {
  constructor(
    private readonly ssoService: SsoService,
    private readonly routeLoader: PermissionsLoaderDialogService,
    private readonly dataState: DataState,
  ) { }

  //changed to canMatch for early match detection and better performance than canLoad.
  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean> {
    this.routeLoader.showDialog('Loader');
    const urlParam = segments[1]?.path;
    return this.ssoService.isAuthorized().pipe(
      map(res => {
        // Need to allow navigation to below dashboards without any restrictions.
        if (urlParam && INSIGHT_NO_PERMISSION_REPORTS.includes(urlParam)) {
          return true;
        }
        const userPerms = [...res.permissions];
        const required = INSIGHTS_DASHBOARD_PERMISSIONS;
        const hasPermission = userPerms.includes(PermissionsEnum.GlobalAdmin) ||
          required.some(p => userPerms.includes(p));
        if (!hasPermission) {
          this.routeLoader.showDialog('PermissionError');
          return false;
        }
        // success - do not close the loader here in case of returning true and it will be closed in the component/guard.
        return true;
      }),
      catchError((error) => {
        console.error('Error in canMatch:', error);
        const currentUrl = globalThis.location.pathname;
        if (!currentUrl.startsWith(`/${APP_ROUTE_CONFIG_URL.SSO}`)) {
          this.ssoService.redirectToSSOLogin();
        }
        return of(false);
      }),
    );
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.routeLoader.showDialog('Loader');

    return this.ssoService.isAuthorized().pipe(
      map(res => this.handleAuthCheck(res, route)),
      catchError(error => this.handleAuthError(error))
    );
  }

  private handleAuthCheck(res: any, route: ActivatedRouteSnapshot): boolean {
    const requiredPerms: number[] = route.data[ROUTE_DATA_KEYS.PERMISSIONS];
    const needsCountryRegionCheck = route.data[ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK] === true;

    if (!requiredPerms) {
      return this.complete(true);
    }

    if (res?.permissions?.length <= 0) {
      return this.rejectWith('PermissionError');
    }

    const hasAccess = this.dataState.hasPermission([...requiredPerms]);
    if (!hasAccess) {
      return this.rejectWith('PermissionError');
    }

    if (needsCountryRegionCheck && !this.countryRegionCheck()) {
      return this.rejectWith('NoCountryRegionAccess');
    }

    return this.complete(true);
  }

  private handleAuthError(error: any): Observable<boolean> {
    console.error('Error occurred while checking authorization:', error);
    this.routeLoader.closeDialog();

    const currentUrl = globalThis.location.pathname;
    if (!currentUrl.startsWith(`/${APP_ROUTE_CONFIG_URL.SSO}`)) {
      this.ssoService.redirectToSSOLogin();
    }

    return of(false);
  }

  private complete(result: boolean): boolean {
    this.routeLoader.closeDialog();
    return result;
  }

  private rejectWith(dialogKey: DialogType): boolean {
    this.routeLoader.closeDialog();
    this.routeLoader.showDialog(dialogKey);
    return false;
  }

  countryRegionCheck(): boolean {
    return this.dataState.hasCountryRegionAccess();
  }
}
