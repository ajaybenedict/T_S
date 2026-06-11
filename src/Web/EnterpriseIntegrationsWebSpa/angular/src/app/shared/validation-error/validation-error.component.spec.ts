import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationErrorComponent } from './validation-error.component';

describe('ValidationErrorComponent', () => {
  let component: ValidationErrorComponent;
  let fixture: ComponentFixture<ValidationErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use default input values on initial render', () => {
    const container: HTMLElement | null = fixture.nativeElement.querySelector('.validation-error-container');
    const icon: HTMLImageElement | null = fixture.nativeElement.querySelector('.ppc-validation-error-img img');
    const message: HTMLSpanElement | null = fixture.nativeElement.querySelector('.ppc-validation-error-desc span');

    expect(container).toBeTruthy();
    expect(container?.classList.contains('validation-error--error')).toBeTrue();
    expect((container as HTMLElement).style.width).toBe('412px');
    expect((container as HTMLElement).style.height).toBe('36px');
    expect(icon?.getAttribute('src')).toBe('/assets/validation_alert_icon_24_24.svg');
    expect(message?.textContent?.trim()).toBe('File size exceeds the limit. Try again');
  });

  it('should render warning variant with warning icon and class', () => {
    component.variant = 'warning';
    fixture.detectChanges();

    const container: HTMLElement | null = fixture.nativeElement.querySelector('.validation-error-container');
    const icon: HTMLImageElement | null = fixture.nativeElement.querySelector('.ppc-validation-error-img img');

    expect(container?.classList.contains('validation-error--warning')).toBeTrue();
    expect(icon?.getAttribute('src')).toBe('/assets/alert_orange_24_24.svg');
  });

  it('should apply custom width and height inputs', () => {
    component.width = '100%';
    component.height = 'auto';
    fixture.detectChanges();

    const container: HTMLElement | null = fixture.nativeElement.querySelector('.validation-error-container');

    expect((container as HTMLElement).style.width).toBe('100%');
    expect((container as HTMLElement).style.height).toBe('auto');
  });

  it('should render message from errorMsg input', () => {
    component.errorMsg = 'RegionKey SESFI not found';
    fixture.detectChanges();

    const message: HTMLSpanElement | null = fixture.nativeElement.querySelector('.ppc-validation-error-desc span');

    expect(message?.textContent?.trim()).toBe('RegionKey SESFI not found');
  });

  it('should fall back to error icon for unsupported variant (negative scenario)', () => {
    component.variant = 'unsupported' as any;
    fixture.detectChanges();

    const icon: HTMLImageElement | null = fixture.nativeElement.querySelector('.ppc-validation-error-img img');

    expect(icon?.getAttribute('src')).toBe('/assets/validation_alert_icon_24_24.svg');
  });

  it('should render empty string when errorMsg is empty (negative scenario)', () => {
    component.errorMsg = '';
    fixture.detectChanges();

    const message: HTMLSpanElement | null = fixture.nativeElement.querySelector('.ppc-validation-error-desc span');

    expect(message?.textContent?.trim()).toBe('');
  });
});
