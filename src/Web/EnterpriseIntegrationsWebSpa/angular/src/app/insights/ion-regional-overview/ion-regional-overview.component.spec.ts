import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IonRegionalOverviewComponent } from './ion-regional-overview.component';

describe('IonRegionalOverviewComponent', () => {
  let component: IonRegionalOverviewComponent;
  let fixture: ComponentFixture<IonRegionalOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IonRegionalOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IonRegionalOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
