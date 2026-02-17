import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcApiResultsHeaderComponent } from './ppc-api-results-header.component';

describe('PpcApiResultsHeaderComponent', () => {
  let component: PpcApiResultsHeaderComponent;
  let fixture: ComponentFixture<PpcApiResultsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcApiResultsHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcApiResultsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
