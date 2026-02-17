import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsightsDashboardComponent } from './insights-dashboard.component';

describe('InsightsDashboardComponent', () => {
  let component: InsightsDashboardComponent;
  let fixture: ComponentFixture<InsightsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsightsDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsightsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
