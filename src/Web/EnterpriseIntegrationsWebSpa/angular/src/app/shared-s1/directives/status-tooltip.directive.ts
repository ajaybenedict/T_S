import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Directive, ElementRef, HostListener, Injector, Input } from "@angular/core";
import { C3DataTableStatusTooltipComponent } from "../c3-data-table-status-tooltip/c3-data-table-status-tooltip.component";

@Directive({selector: '[statusTooltip]'})

export class StatusTooltipDirective {
    private overlayRef: OverlayRef | null = null;

    @Input() title!: string;
    @Input() content!: string;

    constructor(
        private readonly  overlay: Overlay,
        private readonly elementRef: ElementRef,
        private readonly injector: Injector,
    ) { }

    @HostListener('mouseenter')
    show() {
        if (this.overlayRef) return;

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions([{
                originX: 'end',
                originY: 'center',
                overlayX: 'start',
                overlayY: 'center',
                offsetX: 15
            }]);

        this.overlayRef = this.overlay.create({ positionStrategy });
        const tooltipPortal = new ComponentPortal(C3DataTableStatusTooltipComponent, null, this.injector);
        const tooltipRef = this.overlayRef.attach(tooltipPortal);

        // Pass data dynamically
        tooltipRef.instance.title = this.title;
        tooltipRef.instance.content = this.content;
    }

    @HostListener('mouseleave')
    hide() {
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

}