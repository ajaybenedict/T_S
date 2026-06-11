import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionButtonComponent } from './action-button.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('ActionButtonComponent', () => {
  let component: ActionButtonComponent;
  let fixture: ComponentFixture<ActionButtonComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ ActionButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
