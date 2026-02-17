import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C3DataTableStatusTooltipComponent } from './c3-data-table-status-tooltip.component';

describe('C3DataTableStatusTooltipComponent', () => {
  let component: C3DataTableStatusTooltipComponent;
  let fixture: ComponentFixture<C3DataTableStatusTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ C3DataTableStatusTooltipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(C3DataTableStatusTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
