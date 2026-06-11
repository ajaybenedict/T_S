import { Injectable } from '@angular/core';
import { ApplicationIdEnum, CBCPermissionEnum } from '../cbcpermission.config';
export interface UserPermissionScope {
    applicationId: number;
    permissionIds: number[];
    region: string[];
    country: string[];
}

@Injectable({ providedIn: 'platform' })
export class DataState {
    private readonly userPermissionScopes = new Map<number, UserPermissionScope>();

    /**
     * Returns country list for one application scope.
     */
    getUserCountries(applicationId: number) {
        const scope = this.resolveScopeForCountryRegion(applicationId);
        return [...(scope?.country ?? [])];
    }
    /**
     * Reads one permission scope by application id.
     * StreamOneHub + GlobalAdmin always uses StreamOneHub scope across modules.
     */
    private resolveScopeForCountryRegion(applicationId: number): UserPermissionScope | null {
        // StreamOneHub GlobalAdmin can operate across modules and should always use
        // StreamOneHub region/country regardless of requested module application id.
        if (this.hasGlobalAccess()) {
            return this.userPermissionScopes.get(ApplicationIdEnum.CBC) ?? null;
        }

        return this.userPermissionScopes.get(applicationId) ?? null;
    }

    /**
     * StreamOneHub + GlobalAdmin grants cross-module access.
     */
    private hasGlobalAccess(): boolean {
        const landingPermissions = this.userPermissionScopes.get(ApplicationIdEnum.StreamOneHub)?.permissionIds ?? [];
        return landingPermissions.includes(CBCPermissionEnum.GlobalAdmin);
    }

    /**
     * Returns true when the user has at least one required permission for the given application.
     */
    hasPermission(requiredPermissions: number[], applicationId: number): boolean {
        if (!this.isValidNumberArray(requiredPermissions)) {
            return false;
        }

        if (this.hasGlobalAccess()) {
            return true;
        }

        const userPermissions = this.getUserPermissions(applicationId) as number[];
        return (
            userPermissions.length > 0 &&
            requiredPermissions.some(permission => userPermissions.includes(permission))
        );
    }

    private isValidNumberArray(arr: number[] | undefined): arr is number[] {
        return Array.isArray(arr) && arr.length > 0 && arr.every(n => typeof n === 'number');
    }

    /**
     * Returns permission ids for one application only.
     */
    getUserPermissions(applicationId: number): CBCPermissionEnum[] {
        const scopedPermissions = this.userPermissionScopes.get(applicationId)?.permissionIds ?? [];
        return [...scopedPermissions] as CBCPermissionEnum[];
    }

}