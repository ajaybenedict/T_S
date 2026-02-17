import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcMastheadDropdownComponent } from './ppc-masthead-dropdown.component';

describe('PpcMastheadDropdownComponent', () => {
  let component: PpcMastheadDropdownComponent;
  let fixture: ComponentFixture<PpcMastheadDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcMastheadDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcMastheadDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
