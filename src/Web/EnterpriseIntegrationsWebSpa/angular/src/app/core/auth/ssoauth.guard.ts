import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, UrlSegment } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { SsoService } from '../services/sso.service';
import { PermissionsLoaderDialogService } from '../services/permissions-loader-dialog.service';
import { ApplicationIdEnum, CLOUD_TOOLS_DASHBOARD_PERMISSIONS, INSIGHTS_DASHBOARD_PERMISSIONS, PermissionsEnum } from '../config/permissions.config';
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

  /**
   * Module-level authorization check before lazy module match.
   */
  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean> {
    this.routeLoader.showDialog('Loader');
    const urlParam = segments[1]?.path;

    return this.ssoService.isAuthorized().pipe(
      map(() => {
        const applicationId = this.readApplicationId(route);
        const requiredPermissions = this.getModulePermissionsForCanMatch(applicationId, urlParam);
        if (requiredPermissions.length === 0) {
          return true;
        }

        if (applicationId === null) {
          this.routeLoader.showDialog('PermissionError');
          return false;
        }

        const hasPermission = this.dataState.hasPermission(requiredPermissions, applicationId);

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

  /**
   * Returns module-level permission set for top-level modules.
   */
  private getModulePermissionsForCanMatch(applicationId: ApplicationIdEnum | null, urlParam: string | undefined): PermissionsEnum[] {
    if (applicationId === ApplicationIdEnum.Insight) {
      // Need to allow navigation to below dashboards without any restrictions.
      if (urlParam && INSIGHT_NO_PERMISSION_REPORTS.includes(urlParam)) {
        return [];
      }
      return INSIGHTS_DASHBOARD_PERMISSIONS;
    }

    if (applicationId === ApplicationIdEnum.CloudTools) {
      return CLOUD_TOOLS_DASHBOARD_PERMISSIONS;
    }

    return [];
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.routeLoader.showDialog('Loader');

    return this.ssoService.isAuthorized().pipe(
      map(() => this.handleAuthCheck(route)),
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Route-level authorization check using route data applicationId + permissions.
   */
  private handleAuthCheck(route: ActivatedRouteSnapshot): boolean {
    const requiredPerms: number[] = route.data[ROUTE_DATA_KEYS.PERMISSIONS];
    const needsCountryRegionCheck = route.data[ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK] === true;

    if (!requiredPerms) {
      return this.complete(true);
    }

    const applicationId = this.readApplicationId(route);
    if (applicationId === null) {
      return this.rejectWith('PermissionError');
    }

    const hasAccess = this.dataState.hasPermission([...requiredPerms], applicationId);
    if (!hasAccess) {
      return this.rejectWith('PermissionError');
    }

    if (needsCountryRegionCheck && !this.countryRegionCheck(applicationId)) {
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

  /**
   * Country/region check for routes that require geo scoping.
   */
  countryRegionCheck(applicationId: number): boolean {
    return this.dataState.hasCountryRegionAccess(applicationId);
  }

  /**
   * Reads and validates applicationId from route data.
   */
  private readApplicationId(route: Route | ActivatedRouteSnapshot): ApplicationIdEnum | null {
    const value = route.data?.[ROUTE_DATA_KEYS.APPLICATION_ID];
    return typeof value === 'number' && Number.isFinite(value) ? value as ApplicationIdEnum : null;
  }
}
