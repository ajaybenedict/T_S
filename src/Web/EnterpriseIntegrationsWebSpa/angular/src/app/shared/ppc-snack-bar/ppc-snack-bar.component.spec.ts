import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcSnackBarComponent } from './ppc-snack-bar.component';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';

describe('PpcSnackbarComponent', () => {
  let component: PpcSnackBarComponent;
  let fixture: ComponentFixture<PpcSnackBarComponent>;
  let snackBarServiceSpy: jasmine.SpyObj<PpcSnackBarService>;

  beforeEach(async () => {
    snackBarServiceSpy = jasmine.createSpyObj('PpcSnackBarService', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [ PpcSnackBarComponent ],
      providers: [
        {
          provide: PpcSnackBarService,
          useValue: snackBarServiceSpy,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcSnackBarComponent);
    component = fixture.componentInstance;
    component.message = '<span class="safe">Saved</span><img src="x" onerror="alert(1)">';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sanitize snackbar html message', () => {
    const sanitized = component.sanitizedContent;

    expect(sanitized).toContain('<span class="safe">Saved</span>');
    expect(sanitized).not.toContain('onerror');
  });

  it('should dismiss snackbar through service', () => {
    component.dismiss();

    expect(snackBarServiceSpy.dismiss).toHaveBeenCalled();
  });
});
