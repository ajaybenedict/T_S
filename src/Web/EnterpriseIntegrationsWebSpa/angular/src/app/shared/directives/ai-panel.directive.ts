import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { createNgModule, Directive, ElementRef, HostListener, Injector, NgModuleRef, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { DataState } from "src/app/core/services/data-state";

@Directive({
    selector: '[aiPanelTrigger]'
})

export class AIPanelDirective implements OnInit, OnDestroy{

    isPanelOpen: boolean = false;
    private overlayRef: OverlayRef | null = null;
    declare panelStatusSubs: Subscription;

    constructor(
        private readonly injector: Injector,
        private readonly overlay: Overlay,
        private readonly dataState: DataState,
        private readonly elRef: ElementRef,
    ) {}    

    ngOnInit(): void {
        this.panelStatusSubs = this.dataState.aiPanelStatus$.subscribe({
            next: res => {
                if(res === 'Closed') {
                    this.dismissPanel();
                }
            }
        });
    }

    @HostListener('click')
    togglePanel() {
        if(this.overlayRef){
            this.dismissPanel();
            return;
        }
        this.showPanel();
    }

    async showPanel() {
        if(this.overlayRef) return;

        const module = await import('../../ai/ai.module');
        const moduleRef: NgModuleRef<any> = createNgModule(module.AiModule, this.injector);

        const component = (await import('../../ai/chat-layout/chat-layout.component')).ChatLayoutComponent;

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elRef)
            .withFlexibleDimensions()
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                }
            ]);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            hasBackdrop: true,
            width: '90vw', 
            height: '100vh',           
            scrollStrategy: this.overlay.scrollStrategies.reposition(),            
        });

        const panelPortal = new ComponentPortal(component, null, this.injector);
        this.overlayRef.attach(panelPortal);
    }

    dismissPanel() {
        if(this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
            this.isPanelOpen = false;
        }
    }

    ngOnDestroy(): void {
        this.dismissPanel();
        if(this.panelStatusSubs) this.panelStatusSubs.unsubscribe();
    }
}