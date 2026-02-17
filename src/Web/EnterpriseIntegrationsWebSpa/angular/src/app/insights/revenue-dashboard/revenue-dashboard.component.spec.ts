import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueDashboardComponent } from './revenue-dashboard.component';

describe('RevenueDashboardComponent', () => {
  let component: RevenueDashboardComponent;
  let fixture: ComponentFixture<RevenueDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
