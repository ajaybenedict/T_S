import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoToolTipComponent } from './info-tool-tip.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('InfoToolTipComponent', () => {
  let component: InfoToolTipComponent;
  let fixture: ComponentFixture<InfoToolTipComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ InfoToolTipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoToolTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
