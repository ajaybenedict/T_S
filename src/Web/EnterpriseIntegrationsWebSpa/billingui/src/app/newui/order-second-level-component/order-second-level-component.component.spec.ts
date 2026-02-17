import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSecondLevelComponentComponent } from './order-second-level-component.component';

describe('OrderSecondLevelComponentComponent', () => {
  let component: OrderSecondLevelComponentComponent;
  let fixture: ComponentFixture<OrderSecondLevelComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderSecondLevelComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderSecondLevelComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
