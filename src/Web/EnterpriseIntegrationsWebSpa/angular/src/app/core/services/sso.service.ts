import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { API_PATH_PPC, API_V1, APP_ROUTE_CONFIG_URL } from '../constants/constants';
import { DataState } from './data-state';
import { IsAuthorizedResponse } from 'src/app/models/users.interface';

@Injectable({
  providedIn: 'root'
})
export class SsoService {
  isNavigate: boolean = false;
  originalUrl: string = '';


  constructor(private router: Router, private http: HttpClient, private dataState: DataState) { }

  redirectToSSOLogin(): void {
    const { pathname, search } = globalThis.location;

    const hasC3DashboardRoute = pathname.includes('/c3-dashboard');
    const hasQueryParams = !!search && search.length > 1;

    if (!(hasC3DashboardRoute && hasQueryParams)) {
      this.navigateToSSO(null);
      return;
    }

    this.createOAuthState(`${pathname}${search}`);
  }

  private createOAuthState(redirectPath: string): void {
    const payload = { redirectUrl: redirectPath };

    this.http.post<{ state: string }>(
      `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/oauth/state`,
      payload
    )
    .subscribe({
      next: (response) => {
        const stateId = response?.state ?? null;
        this.navigateToSSO(stateId);
      },
      error: (error) => {
        console.error('OAuth state creation failed:', error);
        this.navigateToSSO(null);
      }
    });
  }

  private navigateToSSO(stateId: string | null): void {
    const route = stateId
      ? [APP_ROUTE_CONFIG_URL.SSO, stateId]
      : [APP_ROUTE_CONFIG_URL.SSO];

    this.router.navigate(route)
      .then(success => this.isNavigate = success)
      .catch(err => console.error('Navigation Error:', err));
  }


  redirectToError() {
    this.router.navigate([APP_ROUTE_CONFIG_URL.ERROR_PAGE])
      .then(nav => {
        this.isNavigate = nav;
        // true if navigation is successful
      }, err => {
        console.log(err) // when there's an error
      });
  }

  redirectToSSOLogout() {
    this.router.navigate([APP_ROUTE_CONFIG_URL.LOGOUT])
      .then(nav => {
        this.isNavigate = nav;
        // true if navigation is successful
      }, err => {
        console.log(err) // when there's an error
      });
  }

  automationLogin(obj: any): Observable<any> {
    return this.http.post<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/user/qalogin`, obj);
  }

  sso(obj: any): Observable<any> {
    let myGuid = uuidv4();
    const headers = new HttpHeaders({
      'x-requestid': myGuid,
      'Custom-Header': 'custom-value'
    });
    const requestOptions = { headers: headers };
    return this.http.post<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/user/sso`, obj, requestOptions);
  }

  logout(): Observable<any> {
    return this.http.get<any>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/user/logout`);
  }

  isAuthorized(): Observable<IsAuthorizedResponse> {
    return this.http.get<IsAuthorizedResponse>(`${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}/user/IsAuthorized`).pipe(
      tap(res => {
        this.setUserPermissions(res);
        this.setUserRegions(res);
        this.setUserCountries(res);
      }),
    );
  }

  private setUserCountries(res: IsAuthorizedResponse) {
    const countries = res?.country;
    if (this.isValidArray(countries)) {
      this.dataState.setUserCountries(countries);
    }
  }

  private setUserRegions(res: IsAuthorizedResponse) {
    const regions = res?.region;
    if (this.isValidArray(regions)) {
      this.dataState.setUserRegions(regions);
    }
  }

  private setUserPermissions(res: IsAuthorizedResponse) {
    const permissions = res?.permissions;
    if (this.isValidArray(permissions)) {
      this.dataState.setUserPermissions(permissions);
    }
  }

  private isValidArray(arr: any[]): boolean {
    return Array.isArray(arr) && arr.length > 0;
  }
}
