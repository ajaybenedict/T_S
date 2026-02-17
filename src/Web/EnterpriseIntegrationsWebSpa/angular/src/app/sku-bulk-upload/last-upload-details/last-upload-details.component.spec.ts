import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastUploadDetailsComponent } from './last-upload-details.component';

describe('LastUploadDetailsComponent', () => {
  let component: LastUploadDetailsComponent;
  let fixture: ComponentFixture<LastUploadDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastUploadDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastUploadDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
