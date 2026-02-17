import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1DataTableComponent } from './s1-data-table.component';

describe('S1DataTableComponent', () => {
  let component: S1DataTableComponent;
  let fixture: ComponentFixture<S1DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DataTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
