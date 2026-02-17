import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkuBulkUploadComponent } from './sku-bulk-upload.component';

describe('SkuBulkUploadComponent', () => {
  let component: SkuBulkUploadComponent;
  let fixture: ComponentFixture<SkuBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkuBulkUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkuBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
