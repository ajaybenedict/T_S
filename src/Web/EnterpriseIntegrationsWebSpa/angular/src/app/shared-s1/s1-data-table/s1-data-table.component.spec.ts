import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortDirectionEnum } from 'src/app/models/s1/s1-data-table.interface';

import { S1DataTableComponent } from './s1-data-table.component';

describe('S1DataTableComponent', () => {
  let component: S1DataTableComponent;
  let fixture: ComponentFixture<S1DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DataTableComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DataTableComponent);
    component = fixture.componentInstance;
    component.tableColumns = [];
    component.tableData = [];
    component.activeSortDirection = SortDirectionEnum.DESCENDING;
    component.showProgressBar = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should precompute html columns and status info on input changes', () => {
    component.tableColumns = [
      {
        displayName: 'Order Details',
        columnKey: 'Order Details',
        isSortable: true,
        columnType: 'html',
        formatter: (row: any) => `<span>${row.orderKey}</span>`,
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 1,
      },
      {
        displayName: '',
        columnKey: 'statusInfo',
        isSortable: false,
        columnType: 'statusInfo',
        headerAlignment: 'center',
        cellAlignment: 'center',
        columnID: 0,
      },
    ];

    component.tableData = [
      {
        orderKey: 'S1-TEST-100',
        discontinued: true,
        restricted: false,
      } as any,
    ];

    component.ngOnChanges({
      tableColumns: new SimpleChange([], component.tableColumns, true),
      tableData: new SimpleChange([], component.tableData, true),
    });

    const firstVm = component.dataSource.data[0] as any;
    expect(firstVm.formattedHtmlByColumn['Order Details']).toContain('S1-TEST-100');
    expect(firstVm.warning).toBeTrue();
    expect(firstVm.statusInfo.show).toBeTrue();
    expect(firstVm.statusInfo.iconSrc).toContain('discontinued_icon_16_16.svg');
  });

  it('should emit raw row data when row is clicked', () => {
    const row = { orderKey: 'ROW-EMIT-1' } as any;
    spyOn(component.rowEmitter, 'emit');

    component.onRowClick(new Event('click'), row);

    expect(component.rowEmitter.emit).toHaveBeenCalledWith(row);
  });

});

