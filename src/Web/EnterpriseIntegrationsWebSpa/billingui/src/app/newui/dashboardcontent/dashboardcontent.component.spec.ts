import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardcontentComponent } from './dashboardcontent.component';
import { ToastrService } from 'ngx-toastr';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('DashboardcontentComponent', () => {
  let component: DashboardcontentComponent;
  let fixture: ComponentFixture<DashboardcontentComponent>;

  const toastrMock = {
    success: jasmine.createSpy(),
    error: jasmine.createSpy(),
    info: jasmine.createSpy(),
    warning: jasmine.createSpy()
  };

  beforeEach(async () => {
    await configureTestBed({
      declarations: [DashboardcontentComponent],
      providers: [
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardcontentComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});