import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRuleDetailComponent } from './edit-rule-detail.component';

describe('EditRuleDetailComponent', () => {
  let component: EditRuleDetailComponent;
  let fixture: ComponentFixture<EditRuleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRuleDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRuleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
