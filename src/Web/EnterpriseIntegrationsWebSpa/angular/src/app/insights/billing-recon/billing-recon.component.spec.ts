import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingReconComponent } from './billing-recon.component';

describe('BillingReconComponent', () => {
  let component: BillingReconComponent;
  let fixture: ComponentFixture<BillingReconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingReconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingReconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
