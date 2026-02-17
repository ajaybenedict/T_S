import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcCardComponent } from './ppc-card.component';

describe('PpcCardComponent', () => {
  let component: PpcCardComponent;
  let fixture: ComponentFixture<PpcCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
