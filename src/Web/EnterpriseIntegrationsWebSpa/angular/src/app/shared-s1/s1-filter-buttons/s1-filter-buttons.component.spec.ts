import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1FilterButtonsComponent } from './s1-filter-buttons.component';

describe('S1FilterButtonsComponent', () => {
  let component: S1FilterButtonsComponent;
  let fixture: ComponentFixture<S1FilterButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1FilterButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1FilterButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
