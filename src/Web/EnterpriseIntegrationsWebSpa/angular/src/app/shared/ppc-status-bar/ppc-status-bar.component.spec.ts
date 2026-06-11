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
    component.data = {
      type: 'alert',
      message: '<span class="safe">Upload complete</span><img src="x" onerror="alert(1)">',
      height: '40px',
      showDismissBtn: true,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide mapped config data based on type', () => {
    expect(component.configData.leftBorderColor).toBe('#FF6200');
  });

  it('should sanitize the status bar html content', () => {
    const sanitized = component.sanitizedContent;

    expect(sanitized).toContain('<span class="safe">Upload complete</span>');
    expect(sanitized).not.toContain('onerror');
  });

  it('should emit dismiss event', () => {
    spyOn(component.dismissClicked, 'emit');

    component.emitDismiss();

    expect(component.dismissClicked.emit).toHaveBeenCalledWith(true);
  });
});
