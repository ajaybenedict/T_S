import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1DescriptionCheckboxComponent } from './s1-description-checkbox.component';

describe('S1DescriptionCheckboxComponent', () => {
  let component: S1DescriptionCheckboxComponent;
  let fixture: ComponentFixture<S1DescriptionCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DescriptionCheckboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DescriptionCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
