import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadPanelComponent } from './download-panel.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('DownloadPanelComponent', () => {
  let component: DownloadPanelComponent;
  let fixture: ComponentFixture<DownloadPanelComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ DownloadPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
