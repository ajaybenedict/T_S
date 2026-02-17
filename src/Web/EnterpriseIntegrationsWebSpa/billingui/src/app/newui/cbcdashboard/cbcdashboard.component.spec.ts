import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbcdashboardComponent } from './cbcdashboard.component';

describe('CbcdashboardComponent', () => {
  let component: CbcdashboardComponent;
  let fixture: ComponentFixture<CbcdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbcdashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CbcdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
