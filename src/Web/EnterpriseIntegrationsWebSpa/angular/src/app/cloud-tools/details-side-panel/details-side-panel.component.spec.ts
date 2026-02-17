import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSidePanelComponent } from './details-side-panel.component';

describe('DetailsSidePanelComponent', () => {
  let component: DetailsSidePanelComponent;
  let fixture: ComponentFixture<DetailsSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsSidePanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
