import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectDropdownLabeledComponent } from './multiselect-dropdown-labeled.component';

describe('MultiselectDropdownLabeledComponent', () => {
  let component: MultiselectDropdownLabeledComponent;
  let fixture: ComponentFixture<MultiselectDropdownLabeledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiselectDropdownLabeledComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiselectDropdownLabeledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
