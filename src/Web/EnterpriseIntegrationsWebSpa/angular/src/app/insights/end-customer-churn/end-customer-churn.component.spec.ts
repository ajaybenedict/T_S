import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndCustomerChurnComponent } from './end-customer-churn.component';

describe('EndCustomerChurnComponent', () => {
  let component: EndCustomerChurnComponent;
  let fixture: ComponentFixture<EndCustomerChurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndCustomerChurnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndCustomerChurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
