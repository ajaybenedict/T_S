import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CbcdashboardComponent } from './cbcdashboard.component';
import { TableModule } from 'primeng/table';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('CbcdashboardComponent', () => {
  let component: CbcdashboardComponent;
  let fixture: ComponentFixture<CbcdashboardComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [CbcdashboardComponent],
      imports: [
        TableModule // fixes onPageChange / p-table directive issue
      ],
      schemas: [
        NO_ERRORS_SCHEMA // prevents failures from other unknown components (app-*)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CbcdashboardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});