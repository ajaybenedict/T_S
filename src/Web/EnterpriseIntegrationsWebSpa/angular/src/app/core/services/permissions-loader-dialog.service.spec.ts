import { TestBed } from '@angular/core/testing';

import { PermissionsLoaderDialogService } from './permissions-loader-dialog.service';

describe('PermissionsLoaderDialogService', () => {
  let service: PermissionsLoaderDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionsLoaderDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
