import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellTemplateComponent } from './table-cell-template.component';

describe('TableCellTemplateComponent', () => {
  let component: TableCellTemplateComponent;
  let fixture: ComponentFixture<TableCellTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableCellTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCellTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
