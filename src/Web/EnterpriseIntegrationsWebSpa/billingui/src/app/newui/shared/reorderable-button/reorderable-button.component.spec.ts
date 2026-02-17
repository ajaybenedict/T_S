import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderableButtonComponent } from './reorderable-button.component';

describe('ReorderableButtonComponent', () => {
  let component: ReorderableButtonComponent;
  let fixture: ComponentFixture<ReorderableButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
