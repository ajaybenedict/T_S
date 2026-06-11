import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PpcNavTabsComponent } from './ppc-nav-tabs.component';
import { PPCNavData } from 'src/app/models/ppc-nav.model';

describe('PpcNavTabsComponent', () => {
  let component: PpcNavTabsComponent;
  let fixture: ComponentFixture<PpcNavTabsComponent>;

  const tabs: PPCNavData[] = [
    { label: 'Tab 1', tabContent: undefined as any },
    { label: 'Tab 2', tabContent: undefined as any }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpcNavTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpcNavTabsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default inputs', () => {
    expect(component.tabs).toBeNull();
    expect(component.selectedIndex).toBe(0);
  });

  it('should not render nav container when tabs are null or empty', () => {
    component.tabs = null;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.ppc-nav-container'))).toBeNull();

    component.tabs = [];
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.ppc-nav-container'))).toBeNull();
  });

  it('should render nav container when tabs are provided', () => {
    component.tabs = tabs;

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ppc-nav-container'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('mat-tab-group'))).toBeTruthy();
  });

  it('should emit tabChange when selectedIndexChange is raised by mat-tab-group', () => {
    const emitSpy = spyOn(component.tabChange, 'emit');
    component.tabs = tabs;

    fixture.detectChanges();

    const matTabGroup = fixture.debugElement.query(By.css('mat-tab-group'));
    matTabGroup.triggerEventHandler('selectedIndexChange', 1);

    expect(emitSpy).toHaveBeenCalledWith(1);
  });
});
