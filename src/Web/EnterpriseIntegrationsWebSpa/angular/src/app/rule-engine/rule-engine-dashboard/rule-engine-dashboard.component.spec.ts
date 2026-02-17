import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleEngineDashboardComponent } from './rule-engine-dashboard.component';

describe('RuleEngineDashboardComponent', () => {
  let component: RuleEngineDashboardComponent;
  let fixture: ComponentFixture<RuleEngineDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleEngineDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleEngineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
