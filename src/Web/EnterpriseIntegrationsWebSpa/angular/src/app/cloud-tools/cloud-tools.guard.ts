import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { ApplicationIdEnum } from '../core/config/permissions.config';
import { ROUTE_DATA_KEYS } from '../core/constants/constants';
import { DataState } from '../core/services/data-state';
import { PermissionsLoaderDialogService } from '../core/services/permissions-loader-dialog.service';

/**
 * Cloud Tools route guard using application-scoped permissions.
 */
export const cloudToolsCanActivateGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const dataState = inject(DataState);
  const routeLoaderSVC = inject(PermissionsLoaderDialogService);

  // Cloud Tools routes should always carry applicationId in route data.
  const applicationId = Number(route.data?.[ROUTE_DATA_KEYS.APPLICATION_ID] ?? ApplicationIdEnum.CloudTools);
  const requiredPermissions = route.data?.[ROUTE_DATA_KEYS.PERMISSIONS] as number[] | undefined;
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return true;
  }

  if (dataState.hasPermission(requiredPermissions, applicationId)) {
    return true;
  }

  routeLoaderSVC.showDialog('PermissionError');
  return false;
};
