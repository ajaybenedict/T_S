import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1MenuComponent } from './s1-menu.component';

describe('S1MenuComponent', () => {
  let component: S1MenuComponent;
  let fixture: ComponentFixture<S1MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1MenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
