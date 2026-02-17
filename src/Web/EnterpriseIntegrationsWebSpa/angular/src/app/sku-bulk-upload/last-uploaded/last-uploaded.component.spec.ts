import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastUploadedComponent } from './last-uploaded.component';

describe('LastUploadedComponent', () => {
  let component: LastUploadedComponent;
  let fixture: ComponentFixture<LastUploadedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastUploadedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastUploadedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
