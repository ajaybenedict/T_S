import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1FilterNumericFieldComponent } from './s1-filter-numeric-field.component';

describe('S1FilterNumericFieldComponent', () => {
  let component: S1FilterNumericFieldComponent;
  let fixture: ComponentFixture<S1FilterNumericFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1FilterNumericFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1FilterNumericFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
