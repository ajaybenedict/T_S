import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1DateRangePickerComponent } from './s1-date-range-picker.component';

describe('S1DateRangePickerComponent', () => {
  let component: S1DateRangePickerComponent;
  let fixture: ComponentFixture<S1DateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DateRangePickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
