import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicalOperatorComponent } from './logical-operator.component';

describe('LogicalOperatorComponent', () => {
  let component: LogicalOperatorComponent;
  let fixture: ComponentFixture<LogicalOperatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogicalOperatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogicalOperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
