import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcdashboardComponent } from './ppcdashboard.component';

describe('PpcdashboardComponent', () => {
  let component: PpcdashboardComponent;
  let fixture: ComponentFixture<PpcdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcdashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
