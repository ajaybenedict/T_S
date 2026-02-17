import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoToolTipComponent } from './info-tool-tip.component';

describe('InfoToolTipComponent', () => {
  let component: InfoToolTipComponent;
  let fixture: ComponentFixture<InfoToolTipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
