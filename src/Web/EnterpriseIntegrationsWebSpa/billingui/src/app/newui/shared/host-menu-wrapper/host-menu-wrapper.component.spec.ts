import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostMenuWrapperComponent } from './host-menu-wrapper.component';

describe('HostMenuWrapperComponent', () => {
  let component: HostMenuWrapperComponent;
  let fixture: ComponentFixture<HostMenuWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostMenuWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostMenuWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
