import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelShellComponent } from './panel-shell.component';

describe('PanelShellComponent', () => {
  let component: PanelShellComponent;
  let fixture: ComponentFixture<PanelShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
