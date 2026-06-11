import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestBed } from 'src/app/testing/test-bed.helper';
import { ExpandedTableViewTemplateComponent } from './expanded-table-view-template.component';

describe('ExpandedTableViewTemplateComponent', () => {
  let component: ExpandedTableViewTemplateComponent;
  let fixture: ComponentFixture<ExpandedTableViewTemplateComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ ExpandedTableViewTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandedTableViewTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
