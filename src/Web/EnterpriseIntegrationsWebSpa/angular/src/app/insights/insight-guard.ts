import { ActivatedRouteSnapshot, CanActivateChildFn } from "@angular/router";
import { inject } from "@angular/core";
import { DataState } from "../core/services/data-state";
import { PermissionsEnum } from "../core/config/permissions.config";
import { PermissionsLoaderDialogService } from "../core/services/permissions-loader-dialog.service";
import { ROUTE_DATA_KEYS } from "../core/constants/constants";

export const insightCanActivateGuard: CanActivateChildFn = (route: ActivatedRouteSnapshot) => {         
    const dataState = inject(DataState);
    const routeLoaderSVC = inject(PermissionsLoaderDialogService);

    const userPermissions = dataState.getUserPermissions();
    const requiredPermissions: number[] = route.data[ROUTE_DATA_KEYS.PERMISSIONS];
    const countryRegionCheck = route.data?.[ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK] === true;

    // No specific permissions required for this route -> allow.
    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        // Do not close loader here
        return true;
    }
    const requiredSet = new Set<number>(requiredPermissions);
    const isGlobalAdmin = userPermissions.includes(PermissionsEnum.GlobalAdmin);
    const hasAnyRequired = userPermissions.some(p => requiredSet.has(p));

    // If user has permission(s)
    if (isGlobalAdmin || hasAnyRequired) {
        // If the route also requires country/region access, validate that.
        if (countryRegionCheck && !dataState.hasCountryRegionAccess()) {
            routeLoaderSVC.showDialog('NoCountryRegionAccess');
            return false;
        }
        // Allowed — Do not close loader here. Component will close it.
        return true;
    }

    // User lacks required permission(s).
    routeLoaderSVC.showDialog('PermissionError');
    return false;
}