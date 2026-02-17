import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcSnackBarComponent } from './ppc-snack-bar.component';

describe('PpcSnackbarComponent', () => {
  let component: PpcSnackBarComponent;
  let fixture: ComponentFixture<PpcSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcSnackBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
