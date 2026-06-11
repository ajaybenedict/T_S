/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Route, UrlSegment } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';

import { SsoauthGuard } from './ssoauth.guard';
import { SsoService } from '../services/sso.service';
import { PermissionsLoaderDialogService } from '../services/permissions-loader-dialog.service';
import { DataState } from '../services/data-state';
import { ApplicationIdEnum, PermissionsEnum } from '../config/permissions.config';
import { ROUTE_DATA_KEYS } from '../constants/constants';

describe('SsoauthGuard', () => {
  let guard: SsoauthGuard;
  let ssoServiceSpy: jasmine.SpyObj<SsoService>;
  let routeLoaderSpy: jasmine.SpyObj<PermissionsLoaderDialogService>;
  let dataStateSpy: jasmine.SpyObj<DataState>;

  beforeEach(() => {
    ssoServiceSpy = jasmine.createSpyObj<SsoService>('SsoService', ['isAuthorized', 'redirectToSSOLogin']);
    routeLoaderSpy = jasmine.createSpyObj<PermissionsLoaderDialogService>('PermissionsLoaderDialogService', ['showDialog', 'closeDialog']);
    dataStateSpy = jasmine.createSpyObj<DataState>('DataState', ['hasPermission', 'hasCountryRegionAccess']);

    ssoServiceSpy.isAuthorized.and.returnValue(of({ userPermissions: [] }));

    TestBed.configureTestingModule({
      providers: [
        SsoauthGuard,
        { provide: SsoService, useValue: ssoServiceSpy },
        { provide: PermissionsLoaderDialogService, useValue: routeLoaderSpy },
        { provide: DataState, useValue: dataStateSpy },
      ],
    });

    guard = TestBed.inject(SsoauthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('canActivate should allow route when no permissions are required', async () => {
    const route = {
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.C3,
      },
    } as ActivatedRouteSnapshot;

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBeTrue();
    expect(routeLoaderSpy.closeDialog).toHaveBeenCalled();
    expect(dataStateSpy.hasPermission).not.toHaveBeenCalled();
  });

  it('canActivate should reject with PermissionError when permission check fails', async () => {
    dataStateSpy.hasPermission.and.returnValue(false);

    const route = {
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.C3,
        [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.PreProvisioningCredit],
      },
    } as ActivatedRouteSnapshot;

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBeFalse();
    expect(routeLoaderSpy.showDialog).toHaveBeenCalledWith('PermissionError');
  });

  it('canActivate should reject with NoCountryRegionAccess when geo check fails', async () => {
    dataStateSpy.hasPermission.and.returnValue(true);
    dataStateSpy.hasCountryRegionAccess.and.returnValue(false);

    const route = {
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.C3,
        [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.PreProvisioningOrderApproval],
        [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
      },
    } as ActivatedRouteSnapshot;

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBeFalse();
    expect(routeLoaderSpy.showDialog).toHaveBeenCalledWith('NoCountryRegionAccess');
  });

  it('canActivate should allow when permission and geo checks pass', async () => {
    dataStateSpy.hasPermission.and.returnValue(true);
    dataStateSpy.hasCountryRegionAccess.and.returnValue(true);

    const route = {
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.C3,
        [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.PreProvisioningOrderApproval],
        [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
      },
    } as ActivatedRouteSnapshot;

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBeTrue();
  });

  it('canMatch should allow Insights module when user has one required permission', async () => {
    dataStateSpy.hasPermission.and.returnValue(true);

    const route: Route = {
      path: 'insights',
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.Insight,
      },
    };
    const segments: UrlSegment[] = [new UrlSegment('insights', {}), new UrlSegment('revenue-dashboard', {})];

    const result = await firstValueFrom(guard.canMatch(route, segments));

    expect(result).toBeTrue();
    expect(dataStateSpy.hasPermission).toHaveBeenCalled();
  });

  it('canMatch should reject Insights module when permission check fails', async () => {
    dataStateSpy.hasPermission.and.returnValue(false);

    const route: Route = {
      path: 'insights',
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.Insight,
      },
    };
    const segments: UrlSegment[] = [new UrlSegment('insights', {}), new UrlSegment('revenue-dashboard', {})];

    const result = await firstValueFrom(guard.canMatch(route, segments));

    expect(result).toBeFalse();
    expect(routeLoaderSpy.showDialog).toHaveBeenCalledWith('PermissionError');
  });

  it('canActivate should return false when isAuthorized call fails', async () => {
    ssoServiceSpy.isAuthorized.and.returnValue(throwError(() => new Error('network')));

    const route = {
      data: {
        [ROUTE_DATA_KEYS.APPLICATION_ID]: ApplicationIdEnum.C3,
      },
    } as ActivatedRouteSnapshot;

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBeFalse();
    expect(routeLoaderSpy.closeDialog).toHaveBeenCalled();
    expect(ssoServiceSpy.redirectToSSOLogin).toHaveBeenCalled();
  });
});
