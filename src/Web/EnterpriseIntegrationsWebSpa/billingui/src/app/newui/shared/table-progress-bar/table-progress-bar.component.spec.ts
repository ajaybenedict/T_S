import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableProgressBarComponent } from './table-progress-bar.component';

describe('TableProgressBarComponent', () => {
  let component: TableProgressBarComponent;
  let fixture: ComponentFixture<TableProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableProgressBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
