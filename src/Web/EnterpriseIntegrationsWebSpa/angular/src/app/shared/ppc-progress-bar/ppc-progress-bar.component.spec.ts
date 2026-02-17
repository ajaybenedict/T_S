import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcProgressBarComponent } from './ppc-progress-bar.component';

describe('PpcProgressBarComponent', () => {
  let component: PpcProgressBarComponent;
  let fixture: ComponentFixture<PpcProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcProgressBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
