import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1BreadcrumbComponent } from './s1-breadcrumb.component';

describe('S1BreadcrumbComponent', () => {
  let component: S1BreadcrumbComponent;
  let fixture: ComponentFixture<S1BreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1BreadcrumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
