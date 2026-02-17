// side-panel.tokens.ts
import { InjectionToken } from '@angular/core';
import { SidePanelRef } from './side-panel.ref';


export const SIDE_PANEL_DATA = new InjectionToken<unknown>(
  'SIDE_PANEL_DATA'
);

export const SIDE_PANEL_REF = new InjectionToken<SidePanelRef<unknown, unknown>>(
  'SIDE_PANEL_REF'
);
