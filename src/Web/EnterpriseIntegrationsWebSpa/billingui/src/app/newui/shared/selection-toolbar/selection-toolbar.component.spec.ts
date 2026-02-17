import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionToolbarComponent } from './selection-toolbar.component';

describe('SelectionToolbarComponent', () => {
  let component: SelectionToolbarComponent;
  let fixture: ComponentFixture<SelectionToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
