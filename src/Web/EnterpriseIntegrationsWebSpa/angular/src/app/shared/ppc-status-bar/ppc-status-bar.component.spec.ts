import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcStatusBarComponent } from './ppc-status-bar.component';

describe('PpcStatusBarComponent', () => {
  let component: PpcStatusBarComponent;
  let fixture: ComponentFixture<PpcStatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcStatusBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
