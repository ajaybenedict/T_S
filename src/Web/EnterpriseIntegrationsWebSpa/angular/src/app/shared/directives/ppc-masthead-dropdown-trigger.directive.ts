import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewContainerRef } from '@angular/core';
import { merge, Observable, Subscription } from 'rxjs';
import { PPCMastheadDropdownPanel } from 'src/app/models/ppc-masthead-dropdown.model';

@Directive({
  selector: '[ppcMastheadDropdownTrigger]'
})
export class PpcMastheadDropdownTriggerDirective implements OnDestroy{
  private isDropdownOpen: boolean = false;
  private declare overlayRef: OverlayRef;
  private dropdownClosingActionsSub = Subscription.EMPTY;

  @Input('ppcMastheadDropdownTrigger') public declare dropdownPanel: PPCMastheadDropdownPanel;
  @Output() dropdownStatus = new EventEmitter<boolean>(); // Opened - true / Closed - false

  constructor(
    private readonly overlay: Overlay,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly viewContainerRef: ViewContainerRef,
  ) { }

  @HostListener('click')
  toggleDropdown(): void {
    this.isDropdownOpen ? this.destroyDropdown() : this.openDropdown();
  }

  emitDropdownStatus() {
    this.dropdownStatus.emit(this.isDropdownOpen);
  }

  openDropdown(): void {
    this.isDropdownOpen  = true;   
    this.emitDropdownStatus() ;
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 20,
          }
        ])
    });

    const templatePortal = new TemplatePortal(this.dropdownPanel.templateRef, this.viewContainerRef);
    this.overlayRef.attach(templatePortal);

    this.dropdownClosingActionsSub = this.dropdownClosingActions().subscribe(
      () => this.destroyDropdown()
    );
  }

  private dropdownClosingActions(): Observable<MouseEvent | void> {
    const backdropClick$ = this.overlayRef.backdropClick();
    const detachment$ = this.overlayRef.detachments();
    const dropdownClosed = this.dropdownPanel.closed;

    return merge(backdropClick$, detachment$, dropdownClosed);
  }

  private destroyDropdown(): void {
    if (!this.overlayRef || !this.isDropdownOpen) {
      return;
    }

    this.dropdownClosingActionsSub.unsubscribe();
    this.isDropdownOpen = false;
    this.overlayRef.detach();
    this.emitDropdownStatus();
  }

  ngOnDestroy(): void {
    if(this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
