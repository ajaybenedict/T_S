import { BehaviorSubject, Observable } from "rxjs";
import { TAB_VALUE_NEEDSAPPROVAL } from "../constants/constants";
import { ElementRef, Injectable } from "@angular/core";
import { ApplicationIdEnum, PermissionsEnum } from "../config/permissions.config";
import { User, UserPermissionScope } from "../../models/user.model";

@Injectable({providedIn: 'platform'})
export class DataState {

    private baseUrl = new BehaviorSubject<string>('');
    private coreBaseUrl = new BehaviorSubject<string>('');
    private appsettingObject = new BehaviorSubject<any>(null);
    private selectedPageNo = new BehaviorSubject<any>(null);
    private sortData = new BehaviorSubject<any>(null);
    private orderLinkTypeSetting = new BehaviorSubject<any>(TAB_VALUE_NEEDSAPPROVAL);
    private dateFilter = new BehaviorSubject<any>(null);
    private selectedFilterData = new BehaviorSubject<any>(null);
    private readonly userSubject = new BehaviorSubject<User | null>(null);
    private readonly showRoutingLoaderSubject = new BehaviorSubject<boolean>(false);
    private readonly hasDashboardAPIError = new BehaviorSubject<boolean>(false);
    private readonly ppcSidepanelStatus = new BehaviorSubject<'Opened'|'Closed' | null>(null);
    private ppcFilterPanelAnchorElement?: ElementRef;
    private readonly currentURL = new BehaviorSubject<string>('');
    private readonly aiPanelStatus = new BehaviorSubject<'Opened' | 'Closed' | null>(null);
    private readonly userPermissionScopes = new Map<number, UserPermissionScope>();

    private readonly redirectUrlSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

    redirectUrl$: Observable<string | null> = this.redirectUrlSubject.asObservable();
    user$ = this.userSubject.asObservable();
    ppcSidepanelStatus$ = this.ppcSidepanelStatus.asObservable();
    showRoutingLoader$ = this.showRoutingLoaderSubject.asObservable();
    hasDashboardAPIError$ = this.hasDashboardAPIError.asObservable();
    currentURL$ = this.currentURL.asObservable();
    aiPanelStatus$ = this.aiPanelStatus.asObservable();

    setRedirectUrl(redirectUrl: string | null) {
      const url = redirectUrl ?? localStorage.getItem('redirectUrl');
      if (url) {
        this.redirectUrlSubject.next(url);
        localStorage.removeItem('redirectUrl');
      } else {
        this.redirectUrlSubject.next(null);
      }
    }

    updateRedirectUrl(url: string | null) {
      if (url) {
        localStorage.setItem('redirectUrl', url);
      }
      this.redirectUrlSubject.next(url);
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

    /**
     * Returns true when non-empty country and region values exist for the given application.
     */
    hasCountryRegionAccess(applicationId: number): boolean {
        const scope = this.resolveScopeForCountryRegion(applicationId);

        if (!scope) {
            return false;
        }

        return this.isValidStringArray(scope.region) && this.isValidStringArray(scope.country);
    }

    /**
     * Replaces all cached permission scopes with latest IsAuthorized payload data.
     */
    setUserPermissions(permissionScopes: UserPermissionScope[]) {
        this.userPermissionScopes.clear();

        if (!Array.isArray(permissionScopes) || permissionScopes.length === 0) {
            return;
        }

        for (const scope of permissionScopes) {
            if (!scope || typeof scope.applicationId !== 'number') {
                continue;
            }

            const permissionIds = this.isValidNumberArray(scope.permissionIds) ? scope.permissionIds : [];
            const region = this.isValidStringArray(scope.region) ? scope.region : [];
            const country = this.isValidStringArray(scope.country) ? scope.country : [];

            this.userPermissionScopes.set(scope.applicationId, {
                applicationId: scope.applicationId,
                permissionIds,
                region,
                country,
            });
        }
    }

    /**
     * Returns permission ids for one application only.
     */
    getUserPermissions(applicationId: number): PermissionsEnum[] {
        const scopedPermissions = this.userPermissionScopes.get(applicationId)?.permissionIds ?? [];
        return [...scopedPermissions] as PermissionsEnum[];
    }

    /**
     * Updates region list for one application scope.
     */
    setUserRegions(regions: string[], applicationId: number) {
        const existingScope = this.userPermissionScopes.get(applicationId) ?? {
            applicationId,
            permissionIds: [],
            region: [],
            country: [],
        };

        this.userPermissionScopes.set(applicationId, {
            ...existingScope,
            region: this.isValidStringArray(regions) ? [...regions] : [],
        });
    }

    /**
     * Updates country list for one application scope.
     */
    setUserCountries(countries: string[], applicationId: number) {
        const existingScope = this.userPermissionScopes.get(applicationId) ?? {
            applicationId,
            permissionIds: [],
            region: [],
            country: [],
        };

        this.userPermissionScopes.set(applicationId, {
            ...existingScope,
            country: this.isValidStringArray(countries) ? [...countries] : [],
        });
    }

    /**
     * Returns region list for one application scope.
     */
    getUserRegions(applicationId: number) {
        const scope = this.resolveScopeForCountryRegion(applicationId);
        return [...(scope?.region ?? [])];
    }

    /**
     * Returns country list for one application scope.
     */
    getUserCountries(applicationId: number) {
        const scope = this.resolveScopeForCountryRegion(applicationId);
        return [...(scope?.country ?? [])];
    }

    clearUserPermissions() {
            this.userPermissionScopes.clear();
    }

    setShowRoutingLoader(value: boolean) {
        this.showRoutingLoaderSubject.next(value);
    }

    setHasDashboardAPIError(value: boolean) {
        this.hasDashboardAPIError.next(value);
    }

    selectedFilterDataObs(): Observable<boolean> {
        return this.selectedFilterData.asObservable();
    }

    setSelectedFilterData(obj: any) {
        this.selectedFilterData.next(obj);
    }

    dateFilterObs(): Observable<boolean> {
        return this.dateFilter.asObservable();
    }

    setDateFilter(obj: any) {
        this.dateFilter.next(obj);
    }

    baseUrlObservable(): Observable<string> {
        return this.baseUrl.asObservable();
    }
    coreBaseUrlObservable(): Observable<string> {
        return this.coreBaseUrl.asObservable();
    }

    setBaseURL(url: string) {
        this.baseUrl.next(url);
    }
    setCoreBaseURL(url: string) {
      this.coreBaseUrl.next(url);
    }

    getBaseUrl(): string {
        return this.baseUrl.value;
    }
    getCoreBaseUrl(): string {
      return this.coreBaseUrl.value;
    }

    appsettingObservable(): Observable<any> {
        return this.appsettingObject.asObservable();
    }

    setappsettingObject(obj: any) {
        this.appsettingObject.next(obj);
    }

    orderTypeSettingObservable(): Observable<any> {
        return this.orderLinkTypeSetting.asObservable();
    }

    setorderLinkTypeSetting(obj: any) {
        this.orderLinkTypeSetting.next(obj);
    }

    selectedPageNoObs(): Observable<any> {
        return this.selectedPageNo.asObservable();
    }

    setselectedPageNo(pageIndex: any) {
        return this.selectedPageNo.next(pageIndex);
    }

    sortDataObs(): Observable<any> {
        return this.sortData.asObservable();
    }

    setsortData(sortdata: any) {
        return this.sortData.next(sortdata);
    }

    setUser(user: User | null): void {
        this.userSubject.next(user);
    }

    getUser(): User | null {
        return this.userSubject.value;
    }

    clearUser(): void {
        this.userSubject.next(null);
    }

    setPPCSidepanelStatus(value: 'Opened' | 'Closed') {
        this.ppcSidepanelStatus.next(value);
    }

    setPPCFilterPanelAnchorElement(value: ElementRef) {
        this.ppcFilterPanelAnchorElement = value;
    }

    getPPCFilterPanelAnchorElement() {
        return this.ppcFilterPanelAnchorElement;
    }

    setCurrentURL(value: string) {
        this.currentURL.next(value);
    }

    setAIPanelStatus(value: 'Opened' | 'Closed') {
        this.aiPanelStatus.next(value);
    }

    private isValidStringArray(arr: string[] | undefined): arr is string[] {
        return Array.isArray(arr) && arr.length > 0 && arr.every(s => typeof s === 'string' && s.trim().length > 0);
    }

    private isValidNumberArray(arr: number[] | undefined): arr is number[] {
        return Array.isArray(arr) && arr.length > 0 && arr.every(n => typeof n === 'number');
    }

   /**
     * Reads one permission scope by application id.
     * StreamOneHub + GlobalAdmin always uses StreamOneHub scope across modules.
     */
    private resolveScopeForCountryRegion(applicationId: number): UserPermissionScope | null {
        // StreamOneHub GlobalAdmin can operate across modules and should always use
        // StreamOneHub region/country regardless of requested module application id.
        if (this.hasGlobalAccess()) {
            return this.userPermissionScopes.get(ApplicationIdEnum.StreamOneHub) ?? null;
        }

        return this.userPermissionScopes.get(applicationId) ?? null;
    }

    /**
     * StreamOneHub + GlobalAdmin grants cross-module access.
     */
    private hasGlobalAccess(): boolean {
        const landingPermissions = this.userPermissionScopes.get(ApplicationIdEnum.StreamOneHub)?.permissionIds ?? [];
        return landingPermissions.includes(PermissionsEnum.GlobalAdmin);
    }
}
