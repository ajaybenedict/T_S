import { TestBed } from '@angular/core/testing';

import { PpcPaginatorDataService } from './ppc-paginator-data.service';

describe('PpcPaginatorDataService', () => {
  let service: PpcPaginatorDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpcPaginatorDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
