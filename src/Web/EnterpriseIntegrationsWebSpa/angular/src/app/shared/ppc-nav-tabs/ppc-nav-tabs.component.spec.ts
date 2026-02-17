import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcNavTabsComponent } from './ppc-nav-tabs.component';

describe('PpcNavTabsComponent', () => {
  let component: PpcNavTabsComponent;
  let fixture: ComponentFixture<PpcNavTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcNavTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcNavTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
