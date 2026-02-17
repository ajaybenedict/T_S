import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Directive, HostListener, Injector, OnDestroy, OnInit } from "@angular/core";
import { PpcFilterSidepanelComponent } from "./ppc-filter-sidepanel.component";
import { DataState } from "src/app/core/services/data-state";
import { Subscription } from "rxjs";

@Directive({
    selector: '[ppcFilterSidepanelTrigger]'
})

export class PPCFilterSidepanelDirective implements OnInit ,OnDestroy {
    
    isPanelOpen: boolean = false;
    private overlayRef: OverlayRef | null = null;
    declare panelDismissedSubs: Subscription;

    constructor(        
        private readonly overlay: Overlay,
        private readonly injector: Injector,
        private readonly dataState: DataState,        
    ){}

    ngOnInit(): void {        
        this.panelDismissedSubs = this.dataState.ppcSidepanelStatus$.subscribe({
            next: (res) => {
                if(res == 'Closed') {
                    this.dismissPanel();
                }
            }
        });
    }
    
    @HostListener('click')
    togglePanel() {
        if(this.overlayRef)  {
            this.dismissPanel();
            return;
        }
        
        this.showPanel();
    }
    
    showPanel() {                
        const origin = this.dataState.getPPCFilterPanelAnchorElement()?.nativeElement;
        if(!origin) {
            console.warn('The filter panel cannot be rendered in the UI because the anchor element is unavailable.');
            return;
        }
        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(origin)
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
              hasBackdrop: false,      
              scrollStrategy: this.overlay.scrollStrategies.reposition(),
        }); 
        
        const filterPortal = new ComponentPortal(PpcFilterSidepanelComponent, null, this.injector);
        this.overlayRef.attach(filterPortal);        
        this.isPanelOpen = true;        
        this.dataState.setPPCSidepanelStatus('Opened');
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
    }
}