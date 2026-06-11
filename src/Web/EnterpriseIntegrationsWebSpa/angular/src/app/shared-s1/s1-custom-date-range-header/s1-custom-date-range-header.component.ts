import { ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { S1CustomHeaderButtons } from 'src/app/models/s1/s1-date-range-picker.interface';
import { customCalendarHeaderButtons } from 'src/app/core/config/s1-custom-date-range-header';
import { DateRange, MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';
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
  private baseButtons: S1CustomHeaderButtons[] = this.cloneButtons(customCalendarHeaderButtons);
  buttonsList: S1CustomHeaderButtons[] = this.cloneButtons(customCalendarHeaderButtons);
  
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
      this.baseButtons = this.cloneButtons(buttons.length ? buttons : customCalendarHeaderButtons);
      this.syncButtonsWithCalendarSelection();
      this.cdr.markForCheck(); // trigger change detection
    });
    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.syncButtonsWithCalendarSelection();
      cdr.markForCheck();
    });
  }

  private cloneButtons(buttons: S1CustomHeaderButtons[]): S1CustomHeaderButtons[] {
    return buttons.map(button => ({ ...button }));
  }

  /**
   * Keeps preset selection aligned with the currently selected calendar range.
   * This ensures selection is retained when the picker/header is recreated.
   */
  private syncButtonsWithCalendarSelection(): void {
    const selectedValue = this._calendar.selected;
    const selectedRange = selectedValue instanceof DateRange ? selectedValue : null;
    const targetButtonId = this.resolveButtonIdFromRange(selectedRange) ?? this.getDefaultButtonId();

    this.applySelectedButton(targetButtonId);
  }

  /**
   * Resolves which preset button should be active for the selected range.
   * - exact "today - N days -> today" matches preset N-day button
   * - same start/end date maps to "Custom"
   * - all other ranges map to "Custom"
   */
  private resolveButtonIdFromRange(range: DateRange<D> | null): string | null {
    if (!range?.start || !range?.end) {
      return null;
    }

    const startDate = this.toNormalizedDate(range.start);
    const endDate = this.toNormalizedDate(range.end);

    if (!startDate || !endDate) {
      return null;
    }

    if (startDate.getTime() === endDate.getTime()) {
      return this.getCustomButtonId();
    }

    const today = this.stripTime(new Date());
    if (endDate.getTime() !== today.getTime()) {
      return this.getCustomButtonId();
    }

    const matchedPreset = this.baseButtons.find(button => {
      if (button.days <= 0) {
        return false;
      }

      const expectedStart = new Date(today);
      expectedStart.setDate(expectedStart.getDate() - button.days);
      return startDate.getTime() === expectedStart.getTime();
    });

    return matchedPreset?.id ?? this.getCustomButtonId();
  }

  /**
   * Type guard to check if a value is a Date or has a toDate() method.
   * Supports both native Date objects and date adapters (e.g., Moment.js, Luxon).
   */
  private isDateLike(value: unknown): value is Date | { toDate(): Date } {
    return value instanceof Date || 
           (value !== null && typeof value === 'object' && 'toDate' in value && 
            typeof (value as any).toDate === 'function');
  }

  private toNormalizedDate(value: D): Date | null {
    const rawValue = value as unknown;

    if (this.isDateLike(rawValue)) {
      const date = rawValue instanceof Date ? rawValue : rawValue.toDate();
      return this.stripTime(date);
    }

    const parsedDate = new Date(rawValue as string | number);
    return Number.isNaN(parsedDate.getTime()) ? null : this.stripTime(parsedDate);
  }

  private stripTime(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  private getCustomButtonId(): string {
    return this.baseButtons.find(button => button.days === 0)?.id ?? 'custom';
  }

  private getDefaultButtonId(): string {
    return this.baseButtons.find(button => button.selected)?.id ?? this.baseButtons[0]?.id ?? this.getCustomButtonId();
  }

  private applySelectedButton(buttonId: string): void {
    this.buttonsList = this.baseButtons.map(button => ({
      ...button,
      selected: button.id === buttonId,
    }));
  }

  btnClickHandler(btn: S1CustomHeaderButtons) {
    this.applySelectedButton(btn.id);
    this.configService.setButtons(this.cloneButtons(this.buttonsList));

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
