import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1CardDataTableComponent } from './s1-card-data-table.component';

describe('S1CardDataTableComponent', () => {
  let component: S1CardDataTableComponent;
  let fixture: ComponentFixture<S1CardDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1CardDataTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1CardDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
