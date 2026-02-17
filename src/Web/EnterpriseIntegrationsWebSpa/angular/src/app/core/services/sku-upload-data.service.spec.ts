import { TestBed } from '@angular/core/testing';

import { SkuUploadDataService } from './sku-upload-data.service';

describe('SkuUploadDataService', () => {
  let service: SkuUploadDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkuUploadDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
