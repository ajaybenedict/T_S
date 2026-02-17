import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IonOrderDataComponent } from './ion-order-data.component';

describe('IonOrderDataComponent', () => {
  let component: IonOrderDataComponent;
  let fixture: ComponentFixture<IonOrderDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IonOrderDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IonOrderDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
