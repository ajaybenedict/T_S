import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PpcSnackBarComponent } from 'src/app/shared/ppc-snack-bar/ppc-snack-bar.component';

@Injectable({
  providedIn: 'root'
})
export class PpcSnackBarService {
  private overlayRef: OverlayRef | null = null;
  constructor(
    private overlay: Overlay,
    private injector: Injector,
  ) { }

  private readonly overlayConfig = this.overlay.position().global().centerHorizontally().bottom('10px');

  show(msg: string, duration: number = 5000, positionStrategy: PositionStrategy = this.overlayConfig) {
    if(this.overlayRef) {
      this.dismiss();
    }
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    const snackbarPortal = new ComponentPortal(PpcSnackBarComponent, null, this.injector);
    const snackbarRef = this.overlayRef.attach(snackbarPortal);

    snackbarRef.instance.message = msg;

    setTimeout(() => {
      this.dismiss()
    }, (duration));
  }

  dismiss() {
    if(this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}