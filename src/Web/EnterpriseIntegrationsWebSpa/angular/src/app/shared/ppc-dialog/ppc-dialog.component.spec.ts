import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcDialogComponent } from './ppc-dialog.component';

describe('PpcConfirmDialogComponent', () => {
  let component: PpcDialogComponent;
  let fixture: ComponentFixture<PpcDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
