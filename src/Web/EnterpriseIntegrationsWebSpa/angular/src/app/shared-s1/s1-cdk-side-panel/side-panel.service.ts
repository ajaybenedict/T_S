// side-panel.service.ts
import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';

import { SidePanelConfig } from './side-panel.config';
import { SidePanelRef } from './side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from './side-panel.tokens';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private activeOverlayRef?: OverlayRef;

  constructor(
    private readonly overlay: Overlay,
    private readonly injector: Injector
  ) {}

  open<TData, TResult>(
    component: ComponentType<unknown>,
    config: SidePanelConfig<TData> = {}
  ): SidePanelRef<TData, TResult> {

    this.closeActivePanel();

    const overlayRef = this.createOverlay(config);
    const panelRef = new SidePanelRef<TData, TResult>(overlayRef);

    const panelInjector = Injector.create({
      providers: [
        { provide: SIDE_PANEL_DATA, useValue: config.data },
        { provide: SIDE_PANEL_REF, useValue: panelRef }
      ],
      parent: this.injector
    });

    overlayRef.attach(
      new ComponentPortal(component, undefined, panelInjector)
    );

    // ENTER ANIMATION (next frame)
    requestAnimationFrame(() => {
      const panelElement =
        overlayRef.overlayElement.firstElementChild as HTMLElement | null;
      panelElement?.classList.add('side-panel-enter');
    });

    // Delay backdrop + ESC subscriptions so opening click does NOT close it
    Promise.resolve().then(() => {
      if (!config.disableClose) {
        overlayRef.backdropClick().subscribe(() => panelRef.close());

        overlayRef.keydownEvents().subscribe(event => {
          if (event.key === 'Escape') {
            panelRef.close();
          }
        });
      }
    });

    this.activeOverlayRef = overlayRef;
    return panelRef;
  }

  private closeActivePanel(): void {
    if (this.activeOverlayRef) {
      this.activeOverlayRef.dispose();
      this.activeOverlayRef = undefined;
    }
  }

  private createOverlay<TData>(config: SidePanelConfig<TData>): OverlayRef {
    const headerHeight = config.layoutMode === 'fullscreen'
      ? 0
      : (config.headerHeightPx ?? 68);

    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'side-panel-backdrop',
      panelClass: 'side-panel-pane',
      width: config.width ?? '375px',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position()
        .global()
        .top(`${headerHeight}px`)
        .right('0')
    });
  }
}