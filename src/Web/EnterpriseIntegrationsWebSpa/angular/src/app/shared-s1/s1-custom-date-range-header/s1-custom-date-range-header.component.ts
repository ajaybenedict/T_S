import { ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { S1CustomHeaderButtons } from 'src/app/models/s1/s1-date-range-picker.interface';
import { customCalendarHeaderButtons } from 'src/app/core/config/s1-custom-date-range-header';
import { MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { S1HeaderConfigService } from 'src/app/core/services/s1-header-config.service';

@Component({
  selector: 'app-s1-custom-date-range-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './s1-custom-date-range-header.component.html',
  styleUrls: ['./s1-custom-date-range-header.component.css']
})
export class S1CustomDateRangeHeaderComponent<D> implements OnDestroy{

  private readonly _destroyed = new Subject<void>();
  buttonsList: S1CustomHeaderButtons[] = customCalendarHeaderButtons;
  
  constructor(
    private readonly _calendar: MatCalendar<D>,
    private readonly _dateAdapter: DateAdapter<D>,
    private readonly _picker: MatDateRangePicker<D>,
    @Inject(MAT_DATE_FORMATS) private readonly _dateFormats: MatDateFormats,
    private configService: S1HeaderConfigService,
    readonly cdr: ChangeDetectorRef,
  ) {
    this.configService.buttonsList$
    .pipe(takeUntil(this._destroyed))
    .subscribe(buttons => {
      this.buttonsList = buttons.length ? buttons : customCalendarHeaderButtons;
      this.cdr.markForCheck(); // trigger change detection
    });
    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => cdr.markForCheck());
  }

  btnClickHandler(btn: S1CustomHeaderButtons) {
    // clear the already selected btn if any
    const prevBtn = this.buttonsList.find(el => el.selected);
    if(prevBtn) prevBtn.selected = !prevBtn.selected;
    // marks the newly selected btn
    const currBtn = this.buttonsList.find(el => el.id == btn.id);        
    if(currBtn) currBtn.selected = true;
    
    this.selectRange(btn.days);
  }

  previousHandler(mode: 'month' | 'year') {
    this.changeDate(mode, -1);
  }

  nextHandler(mode: 'month' | 'year') {
    this.changeDate(mode, 1);
  }

  get periodLabel() {    
    return this._dateAdapter
      .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase();
  }

  // called when user selects a range
  selectRange(range: number): void {
    const [start, end] = this.calculateDateRange(range);
    this._picker.select(start);
    this._picker.select(end);
    if(range != 0) {
      this._picker.close();
    } else {
      // for custom range selection, do not close picker. Instead move the calendar to current month
      this._calendar.activeDate = this.today;
    }
  }

  private changeDate(mode: 'month' | 'year', value: -1 | 1) {
    this._calendar.activeDate =
    mode === 'month'
      ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, value)
      : this._dateAdapter.addCalendarYears(this._calendar.activeDate, value);
  } 

  private calculateDateRange(range: number): [start: D, end: D] {
    const today = this.today;
    // For custom range selection, set both as today.
    if(range == 0) return [today, today];

    const start = this._dateAdapter.addCalendarDays(today, -range);
    return [start, today];    
  }

  private get today(): D {
    const today = this._dateAdapter.getValidDateOrNull(new Date());
    if (today === null) {
      throw new Error('date creation failed');
    }
    return today;
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  } 
}
