import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipComponent } from './chip.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ ChipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
