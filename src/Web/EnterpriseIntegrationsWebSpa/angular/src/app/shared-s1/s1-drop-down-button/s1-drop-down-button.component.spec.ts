import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1DropDownButtonComponent } from './s1-drop-down-button.component';

describe('S1DropDownButtonComponent', () => {
  let component: S1DropDownButtonComponent;
  let fixture: ComponentFixture<S1DropDownButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DropDownButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DropDownButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
