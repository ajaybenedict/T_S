import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsPacSubsComponent } from './ms-pac-subs.component';

describe('MsPacSubsComponent', () => {
  let component: MsPacSubsComponent;
  let fixture: ComponentFixture<MsPacSubsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsPacSubsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsPacSubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
