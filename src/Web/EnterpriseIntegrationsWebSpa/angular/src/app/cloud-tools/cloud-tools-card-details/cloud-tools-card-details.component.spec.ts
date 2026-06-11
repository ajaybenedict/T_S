import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolsTaskIdEnum } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';

import { CloudToolsCardDetailsComponent } from './cloud-tools-card-details.component';

describe('CloudToolsCardDetailsComponent', () => {
  let component: CloudToolsCardDetailsComponent;
  let fixture: ComponentFixture<CloudToolsCardDetailsComponent>;
  let cloudToolsApiSvcMock: any;
  let sidePanelSvcMock: any;

  beforeEach(async () => {
    cloudToolsApiSvcMock = {
      getTransactionDetails: jasmine.createSpy('getTransactionDetails').and.returnValue(of({
        transactions: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        timestamp: '',
        message: null,
      })),
    };

    sidePanelSvcMock = {
      open: jasmine.createSpy('open'),
    };

    await TestBed.configureTestingModule({
      declarations: [CloudToolsCardDetailsComponent],
      providers: [
        DatePipe,
        { provide: CloudToolsAPIService, useValue: cloudToolsApiSvcMock },
        { provide: SidePanelService, useValue: sidePanelSvcMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CloudToolsCardDetailsComponent);
    component = fixture.componentInstance;
    component.activeTabId = 0;
    component.inputData = {
      row: {
        id: 'tx-1',
        createdOn: '2026-01-01T00:00:00.000Z',
        createdBy: 'tester',
        requestedBy: 'tester',
        taskId: CloudToolsTaskIdEnum.SubscriptionTransfer,
        taskName: 'SubscriptionTransfer',
      } as any,
      details: {
        transactions: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        timestamp: '',
        message: null,
      } as any,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Text Truncation and Ellipsis', () => {
    it('should render user info sections with proper CSS classes for truncation', () => {
      const userInfoSections = fixture.nativeElement.querySelectorAll('.user-info-section');
      expect(userInfoSections.length).toBeGreaterThan(0);
      userInfoSections.forEach((section: HTMLElement) => {
        expect(section.classList.contains('user-info-section')).toBeTrue();
        expect(section.classList.contains('d-flex')).toBeTrue();
        expect(section.classList.contains('align-items-center')).toBeTrue();
      });
    });

    it('should render "Created By" section with label and text display', () => {
      const createdBySection = fixture.nativeElement.querySelector('.user-info-section');
      expect(createdBySection).toBeTruthy();

      const label = createdBySection.querySelector('.user-info-label');
      expect(label).toBeTruthy();
      expect(label.textContent.trim()).toContain('Created By');
      expect(label.classList.contains('s1-FW700')).toBeTrue();
      expect(label.classList.contains('s1-FS14px')).toBeTrue();

      const textContainer = createdBySection.querySelector('.user-info-text');
      expect(textContainer).toBeTruthy();
    });

    it('should conditionally render "Requested By" section when requestedBy is present', () => {
      component.inputData.row.requestedBy = 'requester-user';
      fixture.detectChanges();

      const userInfoSections = fixture.nativeElement.querySelectorAll('.user-info-section');
      expect(userInfoSections.length).toBe(2);

      const requestedBySection = userInfoSections[1];
      const label = requestedBySection.querySelector('.user-info-label');
      expect(label.textContent.trim()).toContain('Requested By');
    });

    it('should hide "Requested By" section when requestedBy is not present', () => {
      (component.inputData.row as any).requestedBy = null;
      fixture.detectChanges();

      const userInfoSections = fixture.nativeElement.querySelectorAll('.user-info-section');
      expect(userInfoSections.length).toBe(1);
    });

    it('should apply text truncation CSS classes to user info text containers', () => {
      const textContainers = fixture.nativeElement.querySelectorAll('.user-info-text');
      expect(textContainers.length).toBeGreaterThan(0);

      textContainers.forEach((container: HTMLElement) => {
        const computedStyle = window.getComputedStyle(container);
        expect(computedStyle.overflow).toBe('hidden');
        expect(computedStyle.textOverflow).toBe('ellipsis');
        expect(computedStyle.whiteSpace).toBe('nowrap');
      });
    });

    it('should preserve layout when user info contains long text (100+ chars)', () => {
      const longName = 'a'.repeat(120);
      component.inputData.row.createdBy = longName;
      component.inputData.row.requestedBy = longName;
      fixture.detectChanges();

      const headerContainer = fixture.nativeElement.querySelector('.header-container');
      const userInfoWrapper = headerContainer.querySelector('[style*="flex: 1"]');
      expect(userInfoWrapper).toBeTruthy();

      const userInfoSections = fixture.nativeElement.querySelectorAll('.user-info-section');
      userInfoSections.forEach((section: HTMLElement) => {
        const computedStyle = window.getComputedStyle(section);
        expect(computedStyle.maxWidth).toBe('40%');
        expect(computedStyle.minWidth).toBe('0px');
      });
    });

    it('should render both user info text containers when requestedBy exists', () => {
      component.inputData.row.requestedBy = 'requester-user';
      fixture.detectChanges();

      const textContainers = fixture.nativeElement.querySelectorAll('.user-info-text');
      expect(textContainers.length).toBe(2);

      textContainers.forEach((container: HTMLElement) => {
        expect(container).toBeTruthy();
      });
    });

    it('should keep label text visible and non-wrapping', () => {
      const labels = fixture.nativeElement.querySelectorAll('.user-info-label');
      expect(labels.length).toBeGreaterThan(0);

      labels.forEach((label: HTMLElement) => {
        const computedStyle = window.getComputedStyle(label);
        expect(computedStyle.whiteSpace).toBe('nowrap');
        expect(computedStyle.flexShrink).toBe('0');
      });
    });

    it('should render user info wrapper with flex: 1 to allow proper growth', () => {
      const userInfoWrapper = fixture.nativeElement.querySelector('[style*="flex: 1"]');
      expect(userInfoWrapper).toBeTruthy();
      expect(userInfoWrapper.classList.contains('d-flex')).toBeTrue();
      expect(userInfoWrapper.classList.contains('align-items-center')).toBeTrue();

      const computedStyle = window.getComputedStyle(userInfoWrapper);
      expect(computedStyle.minWidth).toBe('0px');
    });

    it('should handle undefined requestedBy gracefully', () => {
      (component.inputData.row as any).requestedBy = undefined;
      fixture.detectChanges();

      const userInfoSections = fixture.nativeElement.querySelectorAll('.user-info-section');
      expect(userInfoSections.length).toBe(1);
    });

    it('should handle empty string requestedBy by hiding the section', () => {
      component.inputData.row.requestedBy = '';
      fixture.detectChanges();

      const userInfoSections = fixture.nativeElement.querySelectorAll('.user-info-section');
      expect(userInfoSections.length).toBe(1);
    });
  });
});
