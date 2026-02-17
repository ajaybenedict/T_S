import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1FlatCheckboxComponent } from './s1-flat-checkbox.component';

describe('S1FlatCheckboxComponent', () => {
  let component: S1FlatCheckboxComponent;
  let fixture: ComponentFixture<S1FlatCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1FlatCheckboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1FlatCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
