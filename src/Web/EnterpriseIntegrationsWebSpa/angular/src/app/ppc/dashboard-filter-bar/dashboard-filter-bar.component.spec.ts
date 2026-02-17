import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFilterBarComponent } from './dashboard-filter-bar.component';

describe('DashboardFilterBarComponent', () => {
  let component: DashboardFilterBarComponent;
  let fixture: ComponentFixture<DashboardFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardFilterBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
