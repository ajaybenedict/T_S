import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastUploadTitleComponent } from './last-upload-title.component';

describe('LastUploadTitleComponent', () => {
  let component: LastUploadTitleComponent;
  let fixture: ComponentFixture<LastUploadTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastUploadTitleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastUploadTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
