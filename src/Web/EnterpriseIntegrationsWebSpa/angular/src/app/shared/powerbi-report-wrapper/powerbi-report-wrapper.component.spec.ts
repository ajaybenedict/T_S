import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerbiReportWrapperComponent } from './powerbi-report-wrapper.component';

describe('PowerbiReportWrapperComponent', () => {
  let component: PowerbiReportWrapperComponent;
  let fixture: ComponentFixture<PowerbiReportWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PowerbiReportWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PowerbiReportWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
