import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcOverlayComponent } from './ppc-overlay.component';

describe('PpcOverlayComponent', () => {
  let component: PpcOverlayComponent;
  let fixture: ComponentFixture<PpcOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
