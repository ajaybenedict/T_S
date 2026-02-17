import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1TableColumnManagerComponent } from './s1-table-column-manager.component';

describe('S1TableColumnManagerComponent', () => {
  let component: S1TableColumnManagerComponent;
  let fixture: ComponentFixture<S1TableColumnManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1TableColumnManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1TableColumnManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
