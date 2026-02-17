import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1SearchBarComponent } from './s1-search-bar.component';

describe('S1SearchBarComponent', () => {
  let component: S1SearchBarComponent;
  let fixture: ComponentFixture<S1SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1SearchBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
