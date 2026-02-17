import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsSecurityComponent } from './ms-security.component';

describe('MsSecurityComponent', () => {
  let component: MsSecurityComponent;
  let fixture: ComponentFixture<MsSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsSecurityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
