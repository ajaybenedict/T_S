import { Overlay } from '@angular/cdk/overlay';
import { ElementRef, ViewContainerRef } from '@angular/core';

import { PpcMastheadDropdownTriggerDirective } from './ppc-masthead-dropdown-trigger.directive';

describe('PpcMastheadDropdownTriggerDirective', () => {
  it('should create an instance', () => {
    const overlayMock = {} as Overlay;
    const elementRefMock = { nativeElement: document.createElement('button') } as ElementRef<HTMLElement>;
    const viewContainerRefMock = {} as ViewContainerRef;

    const directive = new PpcMastheadDropdownTriggerDirective(
      overlayMock,
      elementRefMock,
      viewContainerRefMock,
    );

    expect(directive).toBeTruthy();
  });
});
