import { TestBed } from '@angular/core/testing';

import { DashboardApiErrorInterceptor } from './dashboard-api-error.interceptor';

describe('DashboardApiErrorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      DashboardApiErrorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: DashboardApiErrorInterceptor = TestBed.inject(DashboardApiErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
