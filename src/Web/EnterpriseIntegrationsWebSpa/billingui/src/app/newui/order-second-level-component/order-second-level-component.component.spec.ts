import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestBed } from 'src/app/testing/test-bed.helper';
import { OrderSecondLevelComponent } from './order-second-level-component.component';

describe('OrderSecondLevelComponentComponent', () => {
  let component: OrderSecondLevelComponent;
  let fixture: ComponentFixture<OrderSecondLevelComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ OrderSecondLevelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderSecondLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
