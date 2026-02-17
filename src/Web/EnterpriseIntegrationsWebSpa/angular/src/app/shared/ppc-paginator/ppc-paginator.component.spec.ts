import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcPaginatorComponent } from './ppc-paginator.component';

describe('PpcPaginatorComponent', () => {
  let component: PpcPaginatorComponent;
  let fixture: ComponentFixture<PpcPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcPaginatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
