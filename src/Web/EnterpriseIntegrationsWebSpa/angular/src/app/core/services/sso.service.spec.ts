import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { SsoService } from './sso.service';
import { DataState } from './data-state';
import { UserApiService } from './user-api.service';
import { ApplicationIdEnum, PermissionsEnum } from '../config/permissions.config';
import { IsAuthorizedResponse } from 'src/app/models/user.model';
import { API_PATH_PPC, API_V1 } from '../constants/constants';

describe('SsoService', () => {
  let service: SsoService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dataStateSpy: jasmine.SpyObj<DataState>;
  let userApiServiceSpy: jasmine.SpyObj<UserApiService>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get', 'post']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    dataStateSpy = jasmine.createSpyObj<DataState>('DataState', [
      'getBaseUrl',
      'setUserPermissions',
      'clearUserPermissions',
      'getUser',
      'setUser',
    ]);
    userApiServiceSpy = jasmine.createSpyObj<UserApiService>('UserApiService', ['getUser']);

    dataStateSpy.getBaseUrl.and.returnValue('http://localhost:4200');
    dataStateSpy.getUser.and.returnValue({ firstName: 'Test' } as any);
    userApiServiceSpy.getUser.and.returnValue(of(null as any));

    TestBed.configureTestingModule({
      providers: [
        SsoService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: Router, useValue: routerSpy },
        { provide: DataState, useValue: dataStateSpy },
        { provide: UserApiService, useValue: userApiServiceSpy },
      ],
    });

    service = TestBed.inject(SsoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthorized should store userPermissions when API returns scoped permissions', async () => {
    const response: IsAuthorizedResponse = {
      userPermissions: [
        {
          applicationId: ApplicationIdEnum.C3,
          permissionIds: [PermissionsEnum.PreProvisioningOrderApproval],
          region: ['NAM'],
          country: ['US'],
        },
      ],
    };
    httpSpy.get.and.returnValue(of(response));

    const result = await firstValueFrom(service.isAuthorized());

    expect(result).toEqual(response);
    expect(dataStateSpy.setUserPermissions).toHaveBeenCalledWith(response.userPermissions);
    expect(dataStateSpy.clearUserPermissions).not.toHaveBeenCalled();
  });

  it('isAuthorized should clear permissions when API returns empty userPermissions array', async () => {
    const response: IsAuthorizedResponse = {
      userPermissions: [],
    };
    httpSpy.get.and.returnValue(of(response));

    await firstValueFrom(service.isAuthorized());

    expect(dataStateSpy.clearUserPermissions).toHaveBeenCalled();
    expect(dataStateSpy.setUserPermissions).not.toHaveBeenCalled();
  });

  it('isAuthorized should clear permissions when userPermissions is missing in runtime payload', async () => {
    const runtimeResponse = {
      permissions: [PermissionsEnum.GlobalAdmin],
      region: ['ALL'],
      country: ['ALL'],
    } as unknown as IsAuthorizedResponse;
    httpSpy.get.and.returnValue(of(runtimeResponse));

    await firstValueFrom(service.isAuthorized());

    expect(dataStateSpy.clearUserPermissions).toHaveBeenCalled();
    expect(dataStateSpy.setUserPermissions).not.toHaveBeenCalled();
  });

  it('isAuthorized should call endpoint without gateway path on localhost', async () => {
    httpSpy.get.and.returnValue(of({ userPermissions: [] } as IsAuthorizedResponse));

    await firstValueFrom(service.isAuthorized());

    expect(httpSpy.get).toHaveBeenCalledWith(
      `http://localhost:4200/${API_V1}/user/IsAuthorized`,
    );
  });

  it('isAuthorized should call endpoint with gateway path on non-local hosts', async () => {
    dataStateSpy.getBaseUrl.and.returnValue('https://int-streamone-api.tdsynnex.org');
    httpSpy.get.and.returnValue(of({ userPermissions: [] } as IsAuthorizedResponse));

    await firstValueFrom(service.isAuthorized());

    expect(httpSpy.get).toHaveBeenCalledWith(
      `https://int-streamone-api.tdsynnex.org/${API_PATH_PPC}/${API_V1}/user/IsAuthorized`,
    );
  });

  it('isAuthorized should trim trailing slashes from base URL', async () => {
    dataStateSpy.getBaseUrl.and.returnValue('https://int-streamone-api.tdsynnex.org///');
    httpSpy.get.and.returnValue(of({ userPermissions: [] } as IsAuthorizedResponse));

    await firstValueFrom(service.isAuthorized());

    expect(httpSpy.get).toHaveBeenCalledWith(
      `https://int-streamone-api.tdsynnex.org/${API_PATH_PPC}/${API_V1}/user/IsAuthorized`,
    );
  });

  it('buildApiUrl should trim leading slashes from endpoint', () => {
    dataStateSpy.getBaseUrl.and.returnValue('https://int-streamone-api.tdsynnex.org/');

    const apiUrl = (service as any).buildApiUrl('///user/sso');

    expect(apiUrl).toBe(
      `https://int-streamone-api.tdsynnex.org/${API_PATH_PPC}/${API_V1}/user/sso`,
    );
  });

  it('trimSlashes should remove only leading slashes when fromStart is true', () => {
    const result = (service as any).trimSlashes('///user/sso///', true);

    expect(result).toBe('user/sso///');
  });

  it('trimSlashes should remove only trailing slashes when fromStart is false', () => {
    const result = (service as any).trimSlashes('///user/sso///', false);

    expect(result).toBe('///user/sso');
  });

  it('trimSlashes should return empty string when input is all slashes', () => {
    expect((service as any).trimSlashes('////', true)).toBe('');
    expect((service as any).trimSlashes('////', false)).toBe('');
  });

  it('trimSlashes should keep value unchanged when no edge slashes exist', () => {
    expect((service as any).trimSlashes('user/sso', true)).toBe('user/sso');
    expect((service as any).trimSlashes('user/sso', false)).toBe('user/sso');
  });
});
