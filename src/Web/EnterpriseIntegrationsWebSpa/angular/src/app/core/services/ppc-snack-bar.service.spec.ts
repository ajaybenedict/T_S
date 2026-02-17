import { TestBed } from '@angular/core/testing';

import { PpcSnackBarService } from './ppc-snack-bar.service';

describe('PpcSnackBarService', () => {
  let service: PpcSnackBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpcSnackBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
