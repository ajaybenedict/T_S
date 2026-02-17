import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanelFormsTabComponent } from './side-panel-forms-tab.component';

describe('SidePanelFormsTabComponent', () => {
  let component: SidePanelFormsTabComponent;
  let fixture: ComponentFixture<SidePanelFormsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidePanelFormsTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidePanelFormsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
