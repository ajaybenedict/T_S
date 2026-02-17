import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1CheckboxComponent } from './s1-checkbox.component';

describe('S1CheckboxComponent', () => {
  let component: S1CheckboxComponent;
  let fixture: ComponentFixture<S1CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1CheckboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
