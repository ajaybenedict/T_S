import { TestBed } from '@angular/core/testing';

import { SkuUploadService } from './sku-upload.service';

describe('SkuUploadService', () => {
  let service: SkuUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkuUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
