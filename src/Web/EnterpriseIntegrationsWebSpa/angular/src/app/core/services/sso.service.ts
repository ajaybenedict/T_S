import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { API_PATH_PPC, API_V1, APP_ROUTE_CONFIG_URL } from '../constants/constants';
import { DataState } from './data-state';
import { IsAuthorizedResponse, User, UserResponse } from 'src/app/models/user.model';
import { UserApiService } from './user-api.service';


@Injectable({
  providedIn: 'root'
})
export class SsoService {
  isNavigate: boolean = false;
  originalUrl: string = '';


  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly dataState: DataState,
    private readonly userApiService: UserApiService,
  ) { }

  private isLocalBaseUrl(baseUrl: string): boolean {
    const normalized = (baseUrl ?? '').toLowerCase();
    return normalized.includes('localhost') || normalized.includes('127.0.0.1');
  }

  private trimSlashes(value: string, fromStart: boolean): string {
    if (!value) {
      return '';
    }

    if (fromStart) {
      let index = 0;
      while (index < value.length && value.startsWith('/', index)) {
        index += 1;
      }
      return value.slice(index);
    }

    let end = value.length;
    while (end > 0 && value.endsWith('/', end)) {
      end -= 1;
    }
    return value.slice(0, end);
  }

  private buildApiUrl(endpoint: string): string {
    const baseUrl = this.trimSlashes(this.dataState.getBaseUrl() ?? '', false);
    const cleanEndpoint = this.trimSlashes(endpoint, true);
    const gatewayPath = this.isLocalBaseUrl(baseUrl) ? '' : `/${API_PATH_PPC}`;
    return `${baseUrl}${gatewayPath}/${API_V1}/${cleanEndpoint}`;
  }

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
      this.buildApiUrl('oauth/state'),
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
    return this.http.post<any>(this.buildApiUrl('user/qalogin'), obj);
  }

  sso(obj: unknown): Observable<UserResponse> {
    let myGuid = uuidv4();
    const headers = new HttpHeaders({
      'x-requestid': myGuid,
      'Custom-Header': 'custom-value'
    });
    const requestOptions = { headers: headers };
    return this.http.post<any>(this.buildApiUrl('user/sso'), obj, requestOptions);
  }

  logout(): Observable<any> {
    return this.http.get<any>(this.buildApiUrl('user/logout'));
  }

  /**
   * Loads authorization scopes and stores them in DataState for route/component checks.
   */
  isAuthorized(): Observable<IsAuthorizedResponse> {
    return this.http.get<IsAuthorizedResponse>(this.buildApiUrl('user/IsAuthorized')).pipe(
      tap(res => {
        this.setUserPermissions(res);
      }),
      switchMap(res => this.hydrateUserFromApiIfMissing().pipe(map(() => res))),      
    );
  }

  private hydrateUserFromApiIfMissing(): Observable<void> {
    if (this.dataState.getUser()) {
      return of(void 0);
    }

    return this.userApiService.getUser().pipe(
      tap(userDto => {
        if (!userDto) {
          return;
        }
        const user = new User({
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          emailAddress: userDto.emailAddress,
          userKey: userDto.userKey,
        });
        this.dataState.setUser(user);
      }),
      map(() => void 0),
      catchError((error) => {
        console.error('Failed to hydrate user from API:', error);
        return of(void 0);
      }),
    );
  }

  /**
   * Stores application-scoped user permissions in DataState.
   */
  private setUserPermissions(res: IsAuthorizedResponse) {
    const scopedPermissions = res?.userPermissions;
    if (Array.isArray(scopedPermissions) && scopedPermissions.length > 0) {
      this.dataState.setUserPermissions(scopedPermissions);
      return;
    }
    this.dataState.clearUserPermissions();
  }
}
