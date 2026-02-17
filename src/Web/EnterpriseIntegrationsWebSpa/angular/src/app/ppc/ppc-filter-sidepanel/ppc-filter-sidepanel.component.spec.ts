import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpcFilterSidepanelComponent } from './ppc-filter-sidepanel.component';

describe('PpcFilterSidepanelComponent', () => {
  let component: PpcFilterSidepanelComponent;
  let fixture: ComponentFixture<PpcFilterSidepanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcFilterSidepanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcFilterSidepanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
