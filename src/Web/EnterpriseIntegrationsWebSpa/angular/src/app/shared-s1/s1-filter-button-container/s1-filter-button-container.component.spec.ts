import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1FilterButtonContainerComponent } from './s1-filter-button-container.component';

describe('S1FilterButtonContainerComponent', () => {
  let component: S1FilterButtonContainerComponent;
  let fixture: ComponentFixture<S1FilterButtonContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1FilterButtonContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1FilterButtonContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
