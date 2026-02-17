import { TestBed } from '@angular/core/testing';

import { PpcOverlayService } from './ppc-overlay.service';

describe('PpcOverlayService', () => {
  let service: PpcOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpcOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
