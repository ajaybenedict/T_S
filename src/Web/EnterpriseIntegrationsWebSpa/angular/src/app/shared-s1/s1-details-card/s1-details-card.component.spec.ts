import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1DetailsCardComponent } from './s1-details-card.component';

describe('S1DetailsCardComponent', () => {
  let component: S1DetailsCardComponent;
  let fixture: ComponentFixture<S1DetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DetailsCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
