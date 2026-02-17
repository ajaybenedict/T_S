import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Location } from "@angular/common";
import { AfterViewInit, Directive, ElementRef, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { APP_ROUTE_CONFIG_URL } from "src/app/core/constants/constants";
import { RuleEngineDataService } from "src/app/core/services/rule-engine/rule-engine-data.service";
import { PanelShellComponent } from "src/app/rule-engine/panel-shell/panel-shell.component";

@Directive({
    selector: '[ruleEnginePanelTrigger]'
})

export class RuleEnginePanelDirective implements OnInit, AfterViewInit, OnDestroy {
    isPanelOpen = false;
    declare panelStatusSubs: Subscription;
    private overlayRef: OverlayRef | null = null;
    @HostListener('click')
    togglePanel() {        
        if(this.overlayRef) {
            this.ruleEngineDataSVC.setPanelStatus('Closed');
            return;
        }
        this.showPanel();
    }
    constructor(
        private readonly router: Router,
        private readonly location: Location,
        private readonly overlay: Overlay,
        private readonly ruleEngineDataSVC: RuleEngineDataService,
        private readonly elRef: ElementRef,         
    ){}
    ngOnInit(): void {
        this.panelStatusSubs = this.ruleEngineDataSVC.panelStatus$.subscribe({
            next: res => {
                if(res == 'Closed') {
                    this.closePanel();
                }
            }
        });        
    }

    ngAfterViewInit(): void {
        // If the user refreshed or deep-linked with an active auxiliary outlet,
        // open the panel so the named router-outlet exists and can render.
        const initialUrl = this.location.path(true);
        const hasRuleEngineOutlet = initialUrl.includes('ruleEngineOutlet:') && initialUrl.includes(APP_ROUTE_CONFIG_URL.RULE_ENGINE);
        if (hasRuleEngineOutlet && !this.overlayRef) {
            void this.showPanel(initialUrl);
        }
    }
    async showPanel(reNavigateUrl?: string) {
        if(this.overlayRef) return;
        this.ruleEngineDataSVC.setPanelStatus('Opened');        

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
            width: '75vw', 
            height: '100vh',           
            scrollStrategy: this.overlay.scrollStrategies.reposition(),            
        });

        const portal = new ComponentPortal(PanelShellComponent);
        const panelRef = this.overlayRef.attach(portal);
        // Ensure the named router-outlet exists before navigating to the auxiliary route.
        panelRef.changeDetectorRef.detectChanges();

        if (reNavigateUrl) {
            this.router.navigateByUrl(reNavigateUrl);
        } else {
            this.router.navigate([{outlets: {ruleEngineOutlet: [APP_ROUTE_CONFIG_URL.RULE_ENGINE]}}]); //Auxillary routes
        }
    }
    closePanel() {
        if(this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
            this.isPanelOpen = false;            
        }        
        this.router.navigate([{outlets: {ruleEngineOutlet: null}}]); // to clear the auxillary routes from primary route
    }
    ngOnDestroy(): void {
        this.panelStatusSubs?.unsubscribe();
    }
}