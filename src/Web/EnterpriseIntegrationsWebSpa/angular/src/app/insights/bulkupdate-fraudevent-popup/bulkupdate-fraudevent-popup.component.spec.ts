import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkupdateFraudeventPopupComponent } from './bulkupdate-fraudevent-popup.component';

describe('BulkupdateFraudeventPopupComponent', () => {
  let component: BulkupdateFraudeventPopupComponent;
  let fixture: ComponentFixture<BulkupdateFraudeventPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkupdateFraudeventPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkupdateFraudeventPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
