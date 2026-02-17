// overlay.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ppc-overlay',
  template: `<div class="overlay" *ngIf="show" [ngStyle]="{ width: width, height: height }"></div>`,
  styles: [
    `
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 50%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }      
    `,
  ],
})
export class PpcOverlayComponent {
  @Input() show = false;
  @Input() width = '100%';
  @Input() height = '100%';
}
