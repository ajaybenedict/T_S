import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRuleDetailComponent } from './view-rule-detail.component';

describe('ViewRuleDetailComponent', () => {
  let component: ViewRuleDetailComponent;
  let fixture: ComponentFixture<ViewRuleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRuleDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRuleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
