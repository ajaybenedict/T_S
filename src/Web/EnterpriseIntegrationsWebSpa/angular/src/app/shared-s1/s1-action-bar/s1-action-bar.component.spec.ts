import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1ActionBarComponent } from './s1-action-bar.component';

describe('S1ActionBarComponent', () => {
  let component: S1ActionBarComponent;
  let fixture: ComponentFixture<S1ActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1ActionBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1ActionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
