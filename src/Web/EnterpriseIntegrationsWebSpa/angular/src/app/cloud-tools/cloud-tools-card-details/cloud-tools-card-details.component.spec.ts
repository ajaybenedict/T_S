import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudToolsCardDetailsComponent } from './cloud-tools-card-details.component';

describe('CloudToolsCardDetailsComponent', () => {
  let component: CloudToolsCardDetailsComponent;
  let fixture: ComponentFixture<CloudToolsCardDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloudToolsCardDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudToolsCardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
