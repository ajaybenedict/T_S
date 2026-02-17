import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1GroupCheckboxComponent } from './s1-group-checkbox.component';

describe('S1GroupCheckboxComponent', () => {
  let component: S1GroupCheckboxComponent;
  let fixture: ComponentFixture<S1GroupCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1GroupCheckboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1GroupCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
