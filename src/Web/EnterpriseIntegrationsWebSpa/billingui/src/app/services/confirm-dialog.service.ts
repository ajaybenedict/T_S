import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../newui/shared/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogConfig } from '../interface/confirm-dialog.interface';

@Injectable({ providedIn: 'root' })
export class DialogService implements OnDestroy{

  private currentButtonEl: HTMLElement | null = null;
  private currentDialogRef: MatDialogRef<ConfirmDialogComponent> | null = null;
  private currentPlacement: 'above' | 'below' | 'center' = 'center';
  private currentWidth = 480;

  private resizeHandler: () => void;

  constructor(private readonly dialog: MatDialog) {
    // Bind repositionDialog and save it to resizeHandler
    this.resizeHandler = this.repositionDialog.bind(this);

    // Add the resize event listener once when the service is created
    window.addEventListener('resize', this.resizeHandler);
  }

  openConfirmDialog(
    config: ConfirmDialogConfig,
    event?: MouseEvent
  ): MatDialogRef<ConfirmDialogComponent> | undefined {
    const {
      title,
      message,
      confirmLabel = 'Yes',
      cancelLabel = 'No',
      placement = 'center',
      confirmCallback,
      width = 480
    } = config;

    this.currentWidth = width;
    let position: { top: string; left: string } | undefined;
    let buttonEl: HTMLElement | null = null;

    if (event && placement !== 'center') {
      const rawTarget = (event.currentTarget || event.target) as HTMLElement;
      const anchorEl = rawTarget.closest?.('button') || rawTarget;

      if (!(anchorEl instanceof HTMLElement)) return;

      buttonEl = anchorEl;


      this.currentButtonEl = buttonEl;
      this.currentPlacement = placement;

      position = this.computePos(buttonEl, placement, width);
    } else {
      // Center dialog using CSS (no position passed)
      this.currentButtonEl = null;
      this.currentPlacement = 'center';
      position = undefined;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: `${width}px`,
      hasBackdrop: false,
      panelClass: 'fixed-overlay-dialog',
      ...(position ? { position } : {}),
      data: { title, message, confirmLabel, cancelLabel, confirmCallback }
    });

    this.currentDialogRef = dialogRef;
    return dialogRef;
  }


  private repositionDialog(): void {
    if (!this.currentButtonEl || !this.currentDialogRef || this.currentPlacement === 'center') return;

    const newPosition = this.computePos(this.currentButtonEl, this.currentPlacement, this.currentWidth);
    this.currentDialogRef.updatePosition(newPosition);
  }

  private computePos(
    buttonEl: HTMLElement,
    placement: 'above' | 'below' | 'center',
    width: number
  ): { top: string; left: string } {
    const rect = buttonEl.getBoundingClientRect();
    const estimatedHeight = 200;

    // Center the dialog horizontally relative to the button
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 10));

    let top: number;

    if (placement === 'below') {
      top = rect.bottom + 8;
      if (top + estimatedHeight > window.innerHeight) {
        top = rect.top - estimatedHeight - 8;
      }
    } else if (placement === 'above') {
      top = rect.top - estimatedHeight - 8;
      if (top < 8) {
        top = rect.bottom + 8;
      }
    } else {
      top = 0; // Center will not use this, but return anyway
    }

    top = Math.max(8, Math.min(top, window.innerHeight - estimatedHeight - 8));

    return {
      top: `${top}px`,
      left: `${left}px`
    };
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
