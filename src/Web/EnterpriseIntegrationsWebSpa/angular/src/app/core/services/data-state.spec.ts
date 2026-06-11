import { TestBed } from '@angular/core/testing';

import { DataState } from './data-state';
import { ApplicationIdEnum, PermissionsEnum } from '../config/permissions.config';
import { UserPermissionScope } from '../../models/user.model';

describe('DataState', () => {
  let service: DataState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('hasPermission should return true for any module when StreamOneHub has GlobalAdmin', () => {
    const scopes: UserPermissionScope[] = [
      {
        applicationId: ApplicationIdEnum.StreamOneHub,
        permissionIds: [PermissionsEnum.GlobalAdmin],
        region: ['ALL'],
        country: ['ALL'],
      },
      {
        applicationId: ApplicationIdEnum.CloudTools,
        permissionIds: [PermissionsEnum.ESTManager],
        region: ['NAM'],
        country: ['US'],
      },
    ];

    service.setUserPermissions(scopes);

    expect(
      service.hasPermission(
        [PermissionsEnum.SubscriptionTransfer],
        ApplicationIdEnum.CloudTools,
      ),
    ).toBeTrue();
  });

  it('hasCountryRegionAccess should use requested application scope when StreamOneHub GlobalAdmin is absent', () => {
    const scopes: UserPermissionScope[] = [
      {
        applicationId: ApplicationIdEnum.CloudTools,
        permissionIds: [PermissionsEnum.ESTManager],
        region: ['NAM'],
        country: ['US'],
      },
    ];

    service.setUserPermissions(scopes);

    expect(service.hasCountryRegionAccess(ApplicationIdEnum.CloudTools)).toBeTrue();
    expect(service.getUserRegions(ApplicationIdEnum.CloudTools)).toEqual(['NAM']);
    expect(service.getUserCountries(ApplicationIdEnum.CloudTools)).toEqual(['US']);
  });

  it('hasCountryRegionAccess should return false when no scope exists and StreamOneHub GlobalAdmin is absent', () => {
    const scopes: UserPermissionScope[] = [
      {
        applicationId: ApplicationIdEnum.C3,
        permissionIds: [PermissionsEnum.PreProvisioningOrderApproval],
        region: ['EMEA'],
        country: ['DE'],
      },
    ];

    service.setUserPermissions(scopes);

    expect(service.hasCountryRegionAccess(ApplicationIdEnum.CloudTools)).toBeFalse();
    expect(service.getUserRegions(ApplicationIdEnum.CloudTools)).toEqual([]);
    expect(service.getUserCountries(ApplicationIdEnum.CloudTools)).toEqual([]);
  });

  it('hasCountryRegionAccess should use StreamOneHub region/country for all modules when StreamOneHub has GlobalAdmin', () => {
    const scopes: UserPermissionScope[] = [
      {
        applicationId: ApplicationIdEnum.StreamOneHub,
        permissionIds: [PermissionsEnum.GlobalAdmin],
        region: ['ALL'],
        country: ['ALL'],
      },
      {
        applicationId: ApplicationIdEnum.CloudTools,
        permissionIds: [PermissionsEnum.ESTManager],
        region: ['NAM'],
        country: ['US'],
      },
    ];

    service.setUserPermissions(scopes);

    expect(service.hasCountryRegionAccess(ApplicationIdEnum.CloudTools)).toBeTrue();
    expect(service.getUserRegions(ApplicationIdEnum.CloudTools)).toEqual(['ALL']);
    expect(service.getUserCountries(ApplicationIdEnum.CloudTools)).toEqual(['ALL']);
  });

  it('hasCountryRegionAccess should use StreamOneHub ALL/ALL values even when module scope is missing', () => {
    const scopes: UserPermissionScope[] = [
      {
        applicationId: ApplicationIdEnum.StreamOneHub,
        permissionIds: [PermissionsEnum.GlobalAdmin],
        region: ['ALL'],
        country: ['ALL'],
      },
    ];

    service.setUserPermissions(scopes);

    expect(service.hasCountryRegionAccess(ApplicationIdEnum.CloudTools)).toBeTrue();
    expect(service.getUserRegions(ApplicationIdEnum.CloudTools)).toEqual(['ALL']);
    expect(service.getUserCountries(ApplicationIdEnum.CloudTools)).toEqual(['ALL']);
  });
});
