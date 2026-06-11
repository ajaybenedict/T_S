import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestBed } from 'src/app/testing/test-bed.helper';
import { GroupedTableViewTemplateComponent } from './grouped-table-view-template.component';

describe('GroupedTableViewTemplateComponent', () => {
  let component: GroupedTableViewTemplateComponent;
  let fixture: ComponentFixture<GroupedTableViewTemplateComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ GroupedTableViewTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedTableViewTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
