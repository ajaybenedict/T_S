import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTablecolumnComponent } from './manage-tablecolumn.component';

describe('ManageTablecolumnComponent', () => {
  let component: ManageTablecolumnComponent;
  let fixture: ComponentFixture<ManageTablecolumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageTablecolumnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTablecolumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
