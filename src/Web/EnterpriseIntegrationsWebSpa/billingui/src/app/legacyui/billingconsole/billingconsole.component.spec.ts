import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingconsoleComponent } from './billingconsole.component';
import { UpgradeModule } from '@angular/upgrade/static';

describe('BillingconsoleComponent', () => {
  let component: BillingconsoleComponent;
  let fixture: ComponentFixture<BillingconsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingconsoleComponent],
      providers: [
        { provide: UpgradeModule, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingconsoleComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});