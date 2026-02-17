import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1ChipComponent } from './s1-chip.component';

describe('S1ChipComponent', () => {
  let component: S1ChipComponent;
  let fixture: ComponentFixture<S1ChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1ChipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1ChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
