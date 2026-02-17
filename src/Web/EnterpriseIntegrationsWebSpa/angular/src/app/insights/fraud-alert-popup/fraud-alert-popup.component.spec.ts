import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudAlertPopupComponent } from './fraud-alert-popup.component';

describe('FraudAlertPopupComponent', () => {
  let component: FraudAlertPopupComponent;
  let fixture: ComponentFixture<FraudAlertPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FraudAlertPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraudAlertPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
