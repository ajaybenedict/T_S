import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1CustomDateRangeHeaderComponent } from './s1-custom-date-range-header.component';

describe('S1CustomDateRangeHeaderComponent', () => {
  let component: S1CustomDateRangeHeaderComponent;
  let fixture: ComponentFixture<S1CustomDateRangeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ S1CustomDateRangeHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1CustomDateRangeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
