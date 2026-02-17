import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraverseinfoComponentComponent } from './traverseinfo-component.component';

describe('TraverseinfoComponentComponent', () => {
  let component: TraverseinfoComponentComponent;
  let fixture: ComponentFixture<TraverseinfoComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraverseinfoComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraverseinfoComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
