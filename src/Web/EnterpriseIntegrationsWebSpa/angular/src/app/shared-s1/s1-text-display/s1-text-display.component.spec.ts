import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1TextDisplayComponent } from './s1-text-display.component';

describe('S1TextDisplayComponent', () => {
  let component: S1TextDisplayComponent;
  let fixture: ComponentFixture<S1TextDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1TextDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1TextDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
