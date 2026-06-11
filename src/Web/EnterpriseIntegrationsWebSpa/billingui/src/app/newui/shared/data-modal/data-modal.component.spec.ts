import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataModalComponent } from './data-modal.component';
import { Pipe, PipeTransform } from '@angular/core';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

@Pipe({ name: 'salesorderDetailedViewFormat' })
class MockSalesOrderPipe implements PipeTransform {
  transform(value: any): any {
    return value; // simple passthrough
  }
}
describe('DataModalComponent', () => {
  let component: DataModalComponent;
  let fixture: ComponentFixture<DataModalComponent>;

  beforeEach(async () => {

    
    await configureTestBed({
      declarations: [DataModalComponent, MockSalesOrderPipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataModalComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
