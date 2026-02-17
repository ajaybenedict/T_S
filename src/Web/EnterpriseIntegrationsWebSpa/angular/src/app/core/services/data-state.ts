import { BehaviorSubject, Observable } from "rxjs";
import { TAB_VALUE_NEEDSAPPROVAL } from "../constants/constants";
import { ElementRef, Injectable } from "@angular/core";
import { PermissionsEnum } from "../config/permissions.config";

@Injectable({providedIn: 'root'})
export class DataState {

    private baseUrl = new BehaviorSubject<string>('');
    private coreBaseUrl = new BehaviorSubject<string>('');
    private appsettingObject = new BehaviorSubject<any>(null);
    private selectedPageNo = new BehaviorSubject<any>(null);
    private sortData = new BehaviorSubject<any>(null);
    private orderLinkTypeSetting = new BehaviorSubject<any>(TAB_VALUE_NEEDSAPPROVAL);
    private dateFilter = new BehaviorSubject<any>(null);
    private selectedFilterData = new BehaviorSubject<any>(null);
    private readonly firstNameSubject = new BehaviorSubject<string | null>(null);
    private readonly userEmailSubject = new BehaviorSubject<string | null>(null);
    private readonly showRoutingLoaderSubject = new BehaviorSubject<boolean>(false);
    private readonly hasDashboardAPIError = new BehaviorSubject<boolean>(false);
    private readonly ppcSidepanelStatus = new BehaviorSubject<'Opened'|'Closed' | null>(null);
    private ppcFilterPanelAnchorElement?: ElementRef;
    private readonly currentURL = new BehaviorSubject<string>('');
    private readonly aiPanelStatus = new BehaviorSubject<'Opened' | 'Closed' | null>(null);
    private readonly userPermissions: PermissionsEnum[] = [];
    private readonly userRegions: string[] = [];
    private readonly userCountries: string[] = [];

    private readonly redirectUrlSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

    redirectUrl$: Observable<string | null> = this.redirectUrlSubject.asObservable();
    firstName$ = this.firstNameSubject.asObservable();
    userEmail$ = this.userEmailSubject.asObservable();
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

    hasPermission(requiredPermissions: number[]): boolean {
      return (
        this.userPermissions.length > 0 &&
        requiredPermissions.length > 0 &&
        (
          this.userPermissions.includes(PermissionsEnum.GlobalAdmin) ||
          requiredPermissions.some(permission => this.userPermissions.includes(permission))
        )
      );
    }

    hasCountryRegionAccess() {
        return this.isValidStringArray(this.userRegions) && this.isValidStringArray(this.userCountries);
    }

    setUserPermissions(permissions: PermissionsEnum[]) {
      if(permissions.length > 0) {
        this.userPermissions.length = 0;
        this.userPermissions.push(...permissions);
      }
    }

    getUserPermissions(): PermissionsEnum[] {
        return [...this.userPermissions];
    }

    setUserRegions(regions: string[]) {
        if(regions.length> 0) {
            this.userRegions.length = 0;
            this.userRegions.push(...regions);
        }
    }

    getUserRegions() {
        return [...this.userRegions];
    }

    setUserCountries(countries: string[]) {
        if(countries.length> 0) {
            this.userCountries.length = 0;
            this.userCountries.push(...countries);
        }
    }

    getUserCountries() {
        return [...this.userCountries];
    }

    clearUserPermissions() {
      this.userPermissions.length = 0;
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

    setFirstName(name: string): void {
        this.firstNameSubject.next(name);
        localStorage.setItem('firstName', name);
    }

    hydrateFirstName(): void {
        const name = localStorage.getItem('firstName');
        if (name) {
            this.firstNameSubject.next(name);
        }
    }

    clearFirstName(): void {
        this.firstNameSubject.next(null);
        localStorage.removeItem('firstName');
    }

    setUserEmail(email: string) {
        this.userEmailSubject.next(email);
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

    private isValidStringArray(arr: string[]): boolean {
        return arr.length > 0 && arr.every(s => s.trim().length > 0);
    }
}
