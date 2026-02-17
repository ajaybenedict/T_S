import { Directive, ElementRef, Input, HostListener } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { InfoToolTipComponent } from 'src/app/newui/shared/info-tool-tip/info-tool-tip.component';

@Directive({
  selector: '[appInfoTooltip]'
})
export class InfoTooltipDirective {
  @Input() tooltipTitle = '';
  @Input() tooltipContent = '';

  private overlayRef: OverlayRef | null = null;
  private componentRef: any = null;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly overlay: Overlay
  ) { }

  @HostListener('mouseenter')
  show() {
    if (this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(this.host.nativeElement)
        .withPositions([{
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        }]),
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    const portal = new ComponentPortal(InfoToolTipComponent);
    this.componentRef = this.overlayRef.attach(portal);
    const instance = this.componentRef.instance;
    instance.show(this.tooltipTitle, this.tooltipContent);
  }

  @HostListener('mouseleave')
  hide() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }

  @HostListener('document:click', ['$event'])
  outsideClick(event: MouseEvent) {
    if (
      this.overlayRef &&
      this.componentRef.instance.visible &&
      !this.host.nativeElement.contains(event.target as Node)
    ) {
      this.hide();
    }
  }
}