import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ResellerOverviewPanel,
  ResellerOverviewPanelMockData,
  ResellerOverviewSidePanelData,
} from 'src/app/models/ppc/reseller-overview-panel.interface';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { ResellerOverviewSidePanelComponent } from 'src/app/ppc/reseller-overview-side-panel/reseller-overview-side-panel.component';

describe('ResellerOverviewSidePanelComponent', () => {
  let component: ResellerOverviewSidePanelComponent;
  let fixture: ComponentFixture<ResellerOverviewSidePanelComponent>;
  let panelRefSpy: jasmine.SpyObj<{ close: () => void }>;

  const panelData: ResellerOverviewSidePanelData = {
    resellerOverview: ResellerOverviewPanelMockData,
  };

  beforeEach(async () => {
    panelRefSpy = jasmine.createSpyObj('panelRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ResellerOverviewSidePanelComponent],
      providers: [
        { provide: SIDE_PANEL_REF, useValue: panelRefSpy },
        { provide: SIDE_PANEL_DATA, useValue: panelData },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResellerOverviewSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render three sections using configured titles', () => {
    expect(component.sections.length).toBe(3);
    expect(component.sections[0].title).toBe('Credit Information');
    expect(component.sections[1].title).toBe('Risk & Insurance');
    expect(component.sections[2].title).toBe('Payment & Dunning');
  });

  it('should map tag rows for risk and dunning levels', () => {
    const riskClassRow = component.sections[1].rows[0];
    const dunningLevelRow = component.sections[2].rows[0];

    expect(riskClassRow.isTag).toBeTrue();
    expect(riskClassRow.value).toBe('High Risk');
    expect(dunningLevelRow.isTag).toBeTrue();
    expect(dunningLevelRow.value).toBe('Level 3');
  });

  it('should format next review date as ordinal day month year', () => {
    const nextReviewDateRow = component.sections[2].rows[5];

    expect(nextReviewDateRow.value).toBe('15th Aug, 2026');
  });

  it('should prefer @Input resellerOverview over injected side panel data', () => {
    const inputOverview: ResellerOverviewPanel = {
      ...ResellerOverviewPanelMockData,
      header: {
        ...ResellerOverviewPanelMockData.header,
        resellerName: 'Input Priority Reseller',
      },
    };

    component.resellerOverview = inputOverview;
    component.ngOnChanges({});

    expect(component.activeResellerOverview.header.resellerName).toBe('Input Priority Reseller');
  });

  it('should close panel on closeHandler', () => {
    component.closeHandler();

    expect(panelRefSpy.close).toHaveBeenCalled();
  });
});
