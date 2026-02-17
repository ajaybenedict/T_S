import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcDataTableComponent } from './ppc-data-table.component';

describe('PpcDataTableComponent', () => {
  let component: PpcDataTableComponent;
  let fixture: ComponentFixture<PpcDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcDataTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
