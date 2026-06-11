import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EllipsisTooltipDirective } from './ellipsis-tooltip.directive';

@Component({
  template: `
    <div
      id="tooltipHost"
      [s1EllipsisTooltip]="enabled"
      [s1EllipsisTooltipTrigger]="tooltipTrigger"
      style="display:block; width: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
    >
      {{ text }}
    </div>
  `,
})
class EllipsisTooltipHostComponent {
  enabled = true;
  text = 'Very long text that should overflow';
  tooltipTrigger: unknown = this.text;
}

describe('EllipsisTooltipDirective', () => {
  let fixture: ComponentFixture<EllipsisTooltipHostComponent>;
  let requestAnimationFrameSpy: jasmine.Spy;
  let cancelAnimationFrameSpy: jasmine.Spy;

  beforeEach(async () => {
    requestAnimationFrameSpy = spyOn(window, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback): number => {
      cb(0);
      return 1;
    });
    cancelAnimationFrameSpy = spyOn(window, 'cancelAnimationFrame').and.callFake(() => undefined);

    await TestBed.configureTestingModule({
      declarations: [EllipsisTooltipDirective, EllipsisTooltipHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EllipsisTooltipHostComponent);
    fixture.detectChanges();
  });

  it('should set title on initialization when tooltip is enabled and text is truncated', () => {
    const host = fixture.nativeElement.querySelector('#tooltipHost') as HTMLElement;
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    expect(host.getAttribute('title')).toBeTruthy();
  });

  it('should recompute tooltip when trigger input changes', () => {
    const host = fixture.nativeElement.querySelector('#tooltipHost') as HTMLElement;
    expect(host.getAttribute('title')).toBeTruthy();

    const hostComponent = fixture.componentInstance;
    hostComponent.tooltipTrigger = 'empty-text-update';

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(host.getAttribute('title')).toBeTruthy();
  });

  it('should remove title when tooltip is disabled after being enabled', () => {
    const hostComponent = fixture.componentInstance;
    const host = fixture.nativeElement.querySelector('#tooltipHost') as HTMLElement;

    expect(host.getAttribute('title')).toBeTruthy();

    hostComponent.enabled = false;
    fixture.detectChanges();

    expect(host.getAttribute('title')).toBeNull();
  });

  it('should keep hover/focus fallback behavior when enabled', () => {
    const host = fixture.nativeElement.querySelector('#tooltipHost') as HTMLElement;

    host.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(host.getAttribute('title')).toBeTruthy();

    host.dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    expect(host.getAttribute('title')).toBeTruthy();
  });
});
