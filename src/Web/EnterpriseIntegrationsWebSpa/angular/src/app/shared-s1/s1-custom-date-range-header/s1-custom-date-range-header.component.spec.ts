import { ChangeDetectorRef } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';
import { of } from 'rxjs';

import { S1HeaderConfigService } from 'src/app/core/services/s1-header-config.service';

import { S1CustomDateRangeHeaderComponent } from './s1-custom-date-range-header.component';

describe('S1CustomDateRangeHeaderComponent', () => {
  it('should create', () => {
    const calendarMock = {
      activeDate: new Date(),
      stateChanges: of(void 0),
    } as unknown as MatCalendar<Date>;
    const dateAdapterMock = {
      addCalendarDays: (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
      addCalendarMonths: (date: Date) => date,
      addCalendarYears: (date: Date) => date,
      format: () => 'APR 2026',
      getValidDateOrNull: (date: Date) => date,
    } as unknown as DateAdapter<Date>;
    const pickerMock = {
      select: jasmine.createSpy('select'),
      close: jasmine.createSpy('close'),
    } as unknown as MatDateRangePicker<Date>;
    const formatsMock = { display: { monthYearLabel: 'MMM YYYY' } } as any;
    const configServiceMock = {
      buttonsList$: of([]),
    } as unknown as S1HeaderConfigService;
    const cdrMock = {
      markForCheck: jasmine.createSpy('markForCheck'),
    } as unknown as ChangeDetectorRef;

    const component = new S1CustomDateRangeHeaderComponent<Date>(
      calendarMock,
      dateAdapterMock,
      pickerMock,
      formatsMock,
      configServiceMock,
      cdrMock,
    );

    expect(component).toBeTruthy();
  });
});
