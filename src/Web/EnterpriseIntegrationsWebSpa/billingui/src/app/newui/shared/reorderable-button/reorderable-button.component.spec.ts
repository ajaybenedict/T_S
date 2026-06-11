import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderableButtonComponent } from './reorderable-button.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('ReorderableButtonComponent', () => {
  let component: ReorderableButtonComponent;
  let fixture: ComponentFixture<ReorderableButtonComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ ReorderableButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReorderableButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
