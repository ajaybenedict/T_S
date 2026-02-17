import { TestBed } from '@angular/core/testing';

import { InsightsDashboardApiService } from './insights-dashboard-api.service';

describe('InsightsDashboardApiService', () => {
  let service: InsightsDashboardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsightsDashboardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
