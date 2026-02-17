import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPpcFilterComponent } from './custom-ppc-filter.component';

describe('CustomPpcFilterComponent', () => {
  let component: CustomPpcFilterComponent;
  let fixture: ComponentFixture<CustomPpcFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomPpcFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPpcFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
