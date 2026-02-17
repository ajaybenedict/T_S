import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRuleComponent } from './view-rule.component';

describe('ViewRuleComponent', () => {
  let component: ViewRuleComponent;
  let fixture: ComponentFixture<ViewRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
