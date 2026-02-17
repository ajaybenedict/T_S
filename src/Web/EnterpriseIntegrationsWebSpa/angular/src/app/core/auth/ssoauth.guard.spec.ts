import { TestBed } from '@angular/core/testing';

import { SsoauthGuard } from './ssoauth.guard';

describe('SsoauthGuard', () => {
  let guard: SsoauthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SsoauthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
