import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudToolsDashboardComponent } from './cloud-tools-dashboard.component';

describe('CloudToolsDashboardComponent', () => {
  let component: CloudToolsDashboardComponent;
  let fixture: ComponentFixture<CloudToolsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloudToolsDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudToolsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
