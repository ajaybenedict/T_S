import { ActivatedRouteSnapshot, CanActivateChildFn } from "@angular/router";
import { inject } from "@angular/core";
import { DataState } from "../core/services/data-state";
import { ApplicationIdEnum } from "../core/config/permissions.config";
import { PermissionsLoaderDialogService } from "../core/services/permissions-loader-dialog.service";
import { ROUTE_DATA_KEYS } from "../core/constants/constants";

/**
 * Insight child-route guard using application-scoped permissions.
 * Defaults to Insight applicationId when route data does not provide one.
 */
export const insightCanActivateGuard: CanActivateChildFn = (route: ActivatedRouteSnapshot) => {         
    const dataState = inject(DataState);
    const routeLoaderSVC = inject(PermissionsLoaderDialogService);

    // Use route applicationId when present; otherwise default to Insight.
    const applicationId = Number(route.data?.[ROUTE_DATA_KEYS.APPLICATION_ID] ?? ApplicationIdEnum.Insight);
    const requiredPermissions: number[] = route.data[ROUTE_DATA_KEYS.PERMISSIONS];
    const countryRegionCheck = route.data?.[ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK] === true;

    // No specific permissions required for this route -> allow.
    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        // Do not close loader here
        return true;
    }
    const hasAnyRequired = dataState.hasPermission(requiredPermissions, applicationId);

    // If user has permission(s)
    if (hasAnyRequired) {
        // If the route also requires country/region access, validate that.
        if (countryRegionCheck && !dataState.hasCountryRegionAccess(applicationId)) {
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