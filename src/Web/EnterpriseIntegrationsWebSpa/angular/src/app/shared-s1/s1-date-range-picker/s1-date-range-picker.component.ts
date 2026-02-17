import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { S1CustomDateRangeHeaderComponent } from '../s1-custom-date-range-header/s1-custom-date-range-header.component';
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-s1-date-range-picker',
  templateUrl: './s1-date-range-picker.component.html',
  styleUrls: ['./s1-date-range-picker.component.css'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class S1DateRangePickerComponent implements OnInit {  
  readonly customHeader = S1CustomDateRangeHeaderComponent;
  
  readonly today = new Date();
  readonly previousdate = new Date();
  
  declare range: FormGroup;
  min!: Date;
  max!: Date;
  
  @Input() daysAgo: number = 7;
  @Input() minDays: number = 90;
  @Input() formStartDate: Date = new Date(new Date().setDate(this.today.getDate() - this.daysAgo));
  @Input() formEndDate: Date = this.today;

  @Output() dateRangeChanged = new EventEmitter<{ [key: string]: string }>();

  constructor(
    private readonly fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.max = new Date();
    const baseDate = new Date();
    this.min = new Date();
    this.min.setDate(baseDate.getDate() - (this.minDays ?? 90));
    this.initForm();

    combineLatest([this.range.get('start')!.valueChanges,
    this.range.get('end')!.valueChanges])
      .pipe(
        debounceTime(50), // allow multiple emissions to settle
        filter(([start, end]) =>
          start instanceof Date &&
          end instanceof Date &&
          !isNaN(start.getTime()) &&
          !isNaN(end.getTime())
        ),
        map(([start, end]) => ({
          start: start.toLocaleDateString('en-CA'),
          end: end.toLocaleDateString('en-CA'),
        })),
        distinctUntilChanged((prev, curr) =>
          prev.start === curr.start && prev.end === curr.end
        )
      )
      .subscribe(range => {
        this.dateRangeChanged.emit(range);
      });
  }

  initForm() {
    this.range = this.fb.group({
      start: [this.formStartDate],
      end: [this.formEndDate]
    });
  }
}
