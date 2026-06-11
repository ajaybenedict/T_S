import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ApplicationIdEnum } from 'src/app/core/config/permissions.config';
import { DataState } from 'src/app/core/services/data-state';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { C3_RULE_ENGINE_WORKFLOW_ID, CBC_RULE_ENGINE_WORKFLOW_ID } from 'src/app/core/config/rule-engine.config';

import { RuleEngineDashboardComponent } from './rule-engine-dashboard.component';

/**
 * Creates a TestBed configuration and compiles the component with a given workflowId.
 * This helper is reused across describe blocks so each block can simulate the
 * RuleEnginePanelDirective having called setWorkflowId() before the component loads.
 */
async function createComponent(workflowId: number | null): Promise<{
  component: RuleEngineDashboardComponent;
  fixture: ComponentFixture<RuleEngineDashboardComponent>;
  mockRuleEngineApiService: jasmine.SpyObj<Partial<RuleEngineApiService>>;
  mockRuleEngineDataService: jasmine.SpyObj<Partial<RuleEngineDataService>>;
}> {
  const mockRuleEngineApiService = {
    getUIRuleConfig: jasmine.createSpy('getUIRuleConfig').and.returnValue(of(null)),
    getAllRules: jasmine.createSpy('getAllRules').and.returnValue(of([])),
    getRuleById: jasmine.createSpy('getRuleById').and.returnValue(of(null)),
    updateRule: jasmine.createSpy('updateRule').and.returnValue(of({})),
  };

  const mockRuleEngineDataService = {
    getWorkflowId: jasmine.createSpy('getWorkflowId').and.returnValue(workflowId),
    setWorkflowId: jasmine.createSpy('setWorkflowId'),
    setUIRuleConfig: jasmine.createSpy('setUIRuleConfig'),
    setBreadcrumb: jasmine.createSpy('setBreadcrumb'),
  };

  await TestBed.configureTestingModule({
    declarations: [RuleEngineDashboardComponent],
    providers: [
      DatePipe,
      { provide: RuleEngineApiService, useValue: mockRuleEngineApiService },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      { provide: ActivatedRoute, useValue: {} },
      {
        provide: MatDialog,
        useValue: {
          open: jasmine.createSpy('open').and.returnValue({
            afterClosed: () => of(null),
            close: jasmine.createSpy('close'),
          }),
        },
      },
      { provide: PpcSnackBarService, useValue: { show: jasmine.createSpy('show') } },
      { provide: DataState, useValue: { hasPermission: jasmine.createSpy('hasPermission').and.returnValue(true) } },
      { provide: RuleEngineDataService, useValue: mockRuleEngineDataService },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(RuleEngineDashboardComponent);
  const component = fixture.componentInstance;
  return { component, fixture, mockRuleEngineApiService, mockRuleEngineDataService };
}

describe('RuleEngineDashboardComponent', () => {

  afterEach(() => TestBed.resetTestingModule());

  // ─────────────────────────────────────────────────────────────────────────
  // C3 workflow (workflowId = 1) — passed from AppComponent via directive
  // ─────────────────────────────────────────────────────────────────────────
  describe(`C3 workflow (workflowId = ${C3_RULE_ENGINE_WORKFLOW_ID})`, () => {
    let component: RuleEngineDashboardComponent;
    let fixture: ComponentFixture<RuleEngineDashboardComponent>;
    let mockRuleEngineApiService: jasmine.SpyObj<Partial<RuleEngineApiService>>;
    let mockRuleEngineDataService: jasmine.SpyObj<Partial<RuleEngineDataService>>;

    beforeEach(async () => {
      ({ component, fixture, mockRuleEngineApiService, mockRuleEngineDataService } =
        await createComponent(C3_RULE_ENGINE_WORKFLOW_ID));
      fixture.detectChanges();
    });

    it('should create the component when C3 workflowId is set in the service', () => {
      expect(component).toBeTruthy();
    });

    it('should read workflowId from RuleEngineDataService exactly once during ngOnInit', () => {
      expect(mockRuleEngineDataService.getWorkflowId).toHaveBeenCalledTimes(1);
    });

    it('should write the resolved C3 workflowId back to RuleEngineDataService', () => {
      expect(mockRuleEngineDataService.setWorkflowId)
        .toHaveBeenCalledOnceWith(C3_RULE_ENGINE_WORKFLOW_ID);
    });

    it('should call getAllRules with C3 workflowId in the URL', () => {
      expect(mockRuleEngineApiService.getAllRules).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ WorkflowId: C3_RULE_ENGINE_WORKFLOW_ID }),
        C3_RULE_ENGINE_WORKFLOW_ID
      );
    });

    it('should call getUIRuleConfig with C3 workflowId', () => {
      expect(mockRuleEngineApiService.getUIRuleConfig)
        .toHaveBeenCalledOnceWith(C3_RULE_ENGINE_WORKFLOW_ID);
    });

    it('should build getAllRulesPayload with C3 workflowId and correct ApplicationId', () => {
      expect(component.getAllRulesPayload).toEqual(
        jasmine.objectContaining({
          WorkflowId: C3_RULE_ENGINE_WORKFLOW_ID,
          ApplicationId: ApplicationIdEnum.C3,
        })
      );
    });

    it('should NOT call getAllRules with CBC workflowId', () => {
      const callArgs = (mockRuleEngineApiService.getAllRules as jasmine.Spy).calls.mostRecent().args;
      expect(callArgs[1]).not.toBe(CBC_RULE_ENGINE_WORKFLOW_ID);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CBC workflow (workflowId = 2) — when directive passes CBC workflowId
  // ─────────────────────────────────────────────────────────────────────────
  describe(`CBC workflow (workflowId = ${CBC_RULE_ENGINE_WORKFLOW_ID})`, () => {
    let component: RuleEngineDashboardComponent;
    let fixture: ComponentFixture<RuleEngineDashboardComponent>;
    let mockRuleEngineApiService: jasmine.SpyObj<Partial<RuleEngineApiService>>;
    let mockRuleEngineDataService: jasmine.SpyObj<Partial<RuleEngineDataService>>;

    beforeEach(async () => {
      ({ component, fixture, mockRuleEngineApiService, mockRuleEngineDataService } =
        await createComponent(CBC_RULE_ENGINE_WORKFLOW_ID));
      fixture.detectChanges();
    });

    it('should create the component when CBC workflowId is set in the service', () => {
      expect(component).toBeTruthy();
    });

    it('should write the resolved CBC workflowId back to RuleEngineDataService', () => {
      expect(mockRuleEngineDataService.setWorkflowId)
        .toHaveBeenCalledOnceWith(CBC_RULE_ENGINE_WORKFLOW_ID);
    });

    it('should call getAllRules with CBC workflowId in the URL', () => {
      expect(mockRuleEngineApiService.getAllRules).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ WorkflowId: CBC_RULE_ENGINE_WORKFLOW_ID }),
        CBC_RULE_ENGINE_WORKFLOW_ID
      );
    });

    it('should call getUIRuleConfig with CBC workflowId', () => {
      expect(mockRuleEngineApiService.getUIRuleConfig)
        .toHaveBeenCalledOnceWith(CBC_RULE_ENGINE_WORKFLOW_ID);
    });

    it('should NOT call getAllRules with C3 workflowId', () => {
      const callArgs = (mockRuleEngineApiService.getAllRules as jasmine.Spy).calls.mostRecent().args;
      expect(callArgs[1]).not.toBe(C3_RULE_ENGINE_WORKFLOW_ID);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Guard: invalid / missing workflowId — directive never called setWorkflowId
  // ─────────────────────────────────────────────────────────────────────────
  describe('invalid workflowId guard', () => {
    const invalidCases: Array<{ label: string; value: number | null }> = [
      { label: 'null (directive never set it)', value: null },
      { label: 'zero',                          value: 0 },
      { label: 'negative',                      value: -1 },
    ];

    invalidCases.forEach(({ label, value }) => {
      it(`should throw when workflowId is ${label}`, async () => {
        const { fixture } = await createComponent(value);
        expect(() => fixture.detectChanges()).toThrowError(/Missing or invalid workflowId/);
      });
    });
  });
});
