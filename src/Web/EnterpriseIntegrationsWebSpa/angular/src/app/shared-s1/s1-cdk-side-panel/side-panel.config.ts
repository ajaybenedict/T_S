// side-panel.config.ts
export interface SidePanelConfig<TData = unknown> {
  readonly data?: TData;
  readonly width?: string;
  readonly position?: 'left' | 'right';
  readonly disableClose?: boolean;
  readonly hasBackdrop?: boolean;
  readonly panelClass?: string;
  readonly backdropClass?: string;
  readonly layoutMode?: 'fullscreen' | 'below-header';
  readonly headerHeightPx?: number;
}