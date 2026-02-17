import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1CheckboxDropdownComponent } from './s1-checkbox-dropdown.component';

describe('S1CheckboxDropdownComponent', () => {
  let component: S1CheckboxDropdownComponent;
  let fixture: ComponentFixture<S1CheckboxDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1CheckboxDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1CheckboxDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
