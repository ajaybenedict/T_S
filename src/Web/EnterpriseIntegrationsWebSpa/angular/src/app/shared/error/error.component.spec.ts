import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep default formatted message', () => {
    expect(component.errorMsg).toContain('ppc-bold-txt');
  });

  it('should sanitize html passed to getSanitizedHTML', () => {
    const sanitized = component.getSanitizedHTML('<span class="safe">Message</span><img src="x" onerror="alert(1)">');

    expect(sanitized).toContain('<span class="safe">Message</span>');
    expect(sanitized).not.toContain('onerror');
  });
});
