import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RuleTypeEnum } from 'src/app/models/rule-engine/rule-engine';
import { RuleEditorField } from 'src/app/models/rule-engine/rule-editor-config.model';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RuleEditorConfigAdapter } from 'src/app/core/services/rule-engine/rule-editor-config-adapter.service';

import { ViewRuleComponent } from './view-rule.component';

function createField(overrides: Partial<RuleEditorField>): RuleEditorField {
  return {
    id: 1,
    applicationId: 1,
    workflowId: 1,
    key: 'test',
    title: 'Test',
    dataType: 'decimal',
    usedIn: 'expressionBuilder',
    validations: null,
    allowedOverrides: [],
    rulePrecedence: null,
    dataSource: null,
    values: null,
    isComparable: true,
    application: null,
    ...overrides,
  };
}

describe('ViewRuleComponent', () => {
  let component: ViewRuleComponent;
  let fixture: ComponentFixture<ViewRuleComponent>;
  let mockRuleEngineDataService: jasmine.SpyObj<RuleEngineDataService>;
  let mockRuleConfigAdapter: jasmine.SpyObj<RuleEditorConfigAdapter>;

  beforeEach(async () => {
    mockRuleEngineDataService = jasmine.createSpyObj('RuleEngineDataService', ['getUIRuleConfig', 'getOverrideValue', 'getWorkflowId']);
    mockRuleEngineDataService.getOverrideValue.and.returnValue(null);
    mockRuleEngineDataService.getWorkflowId.and.returnValue(1);
    mockRuleConfigAdapter = jasmine.createSpyObj('RuleEditorConfigAdapter', ['getShellConfigForWorkflow']);
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: true } as any);

    await TestBed.configureTestingModule({
      declarations: [ ViewRuleComponent ],
      providers: [
        { provide: RuleEngineDataService, useValue: mockRuleEngineDataService },
        { provide: RuleEditorConfigAdapter, useValue: mockRuleConfigAdapter },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRuleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);
    expect(component).toBeTruthy();
  });

  it('should load attribute list from data service on init', () => {
    const attributeList = [
      createField({ key: 'amount', title: 'Order Amount' }),
      createField({ key: 'unbilledUsage', title: 'Unbilled Usage' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(mockRuleEngineDataService.getUIRuleConfig).toHaveBeenCalledTimes(1);
    expect(component.attributeList).toEqual(attributeList);
  });

  it('should default to empty attribute list when config has no attributeList', () => {
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({} as any);

    component.ngOnInit();

    expect(component.attributeList).toEqual([]);
  });

  it('should infer conditional rule type for multi-clause expression', () => {
    component.inputData = '(input1.Amount > 10) && (input1.country == "US")';
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(component.ruleType).toBe(RuleTypeEnum.Conditional);
    expect(component.compareParts).toBeNull();
    expect(component.otherRows.length).toBeGreaterThan(0);
  });

  it('should infer compare rule type and parse compare parts', () => {
    component.inputData = '(input1.Amount > input1.country - input1.region)';
    component.action = 'Approve';
    const attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
      createField({ key: 'region', title: 'Region Name' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.ruleType).toBe(RuleTypeEnum.Compare);
    expect(component.compareParts).toEqual({
      attr1: 'Amount',
      logicalOperator: '>',
      attr2: 'country',
      arithmeticOperator: '-',
      attr3: 'region',
    });
    expect(component.getAttributeTitle('Amount')).toBe('Order Amount');
    expect(component.getAttributeTitle('country')).toBe('Country Name');
    expect(component.getAttributeTitle('region')).toBe('Region Name');
    expect(component.getCompareSummary()).toBe('If Order Amount is > (Country Name - Region Name), then <span class="s1-FW700">Approve</span>.');
  });

  it('should fallback to conditional rendering when compare feature is disabled', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: false } as any);
    component.inputData = '(input1.Amount > input1.country - input1.region)';
    component.action = 'Approve';
    const attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
      createField({ key: 'region', title: 'Region Name' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.ruleType).toBe(RuleTypeEnum.Conditional);
    expect(component.compareParts).toBeNull();
    expect(component.getCompareSummary()).toBe('');
  });

  it('should include reseller criteria in compare summary when criteria clause exists', () => {
    component.inputData = '(input1.Region = "EMEA") && (input1.Amount > input1.country - input1.region)';
    component.action = 'Approve';
    mockRuleEngineDataService.getOverrideValue.and.returnValue('Reseller');
    const attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
      createField({ key: 'region', title: 'Region Name' }),
      createField({ key: 'Region', title: 'Region' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.showCriteriaSection).toBeTrue();
    expect(component.criteriaSummaryLabel).toBe('Region');
    expect(component.criteriaSummaryValue).toBe('EMEA');
    expect(component.getCompareSummary()).toBe('If Order Amount is > (Country Name - Region Name) & Region is EMEA, then <span class="s1-FW700">Approve</span>.');
  });

  it('should use override input to show reseller criteria section in view mode', () => {
    component.inputData = '(input1.country = "India") && (input1.amount > input1.unbilledUsage + input1.available)';
    component.action = 'Approve';
    component.overrideLevelName = 'Reseller';
    mockRuleEngineDataService.getOverrideValue.and.returnValue(null);
    const attributeList = [
      createField({ key: 'amount', title: 'Amount' }),
      createField({ key: 'unbilledUsage', title: 'Unbilled Usage' }),
      createField({ key: 'available', title: 'Available' }),
      createField({ key: 'country', title: 'Country' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.showCriteriaSection).toBeTrue();
    expect(component.criteriaSummaryLabel).toBe('Country');
    expect(component.criteriaSummaryValue).toBe('India');
  });

  it('should return empty compare summary for reseller when criteria clause is missing', () => {
    component.inputData = '(input1.Amount > input1.country - input1.region)';
    component.action = 'Approve';
    mockRuleEngineDataService.getOverrideValue.and.returnValue('Reseller');
    const attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
      createField({ key: 'region', title: 'Region Name' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.showCriteriaSection).toBeFalse();
    expect(component.getCompareSummary()).toBe('');
  });

  it('should render compare summary criteria when expression row values are dropdown objects', () => {
    component.action = 'Approve';
    component.ruleType = RuleTypeEnum.Compare;
    component.selectedOverride = 'Reseller';
    component.compareParts = {
      attr1: 'Amount',
      logicalOperator: '>',
      attr2: 'country',
      arithmeticOperator: '-',
      attr3: 'region',
    };
    component.attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
      createField({ key: 'region', title: 'Region Name' }),
      createField({ key: 'Region', title: 'Region' }),
    ];
    component.expressions = [
      {
        attribute: { label: 'Region', value: 'Region' },
        operator: { label: '=', value: '=' },
        value: { label: 'EMEA', value: 'EMEA' },
      } as any,
    ];

    expect(component.criteriaSummaryLabel).toBe('Region');
    expect(component.criteriaSummaryValue).toBe('EMEA');
    expect(component.getCompareSummary()).toBe('If Order Amount is > (Country Name - Region Name) & Region is EMEA, then <span class="s1-FW700">Approve</span>.');
  });

  it('should use object value fallback when label is missing', () => {
    const row: any = {
      value: { value: 'Denmark' },
    };

    expect(component.getValueString(row)).toBe('Denmark');
  });

  it('should fallback to key when attribute is not found in attribute list', () => {
    component.inputData = '(input1.Amount > input1.country - input1.region)';
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList: [] } as any);

    component.ngOnInit();

    expect(component.getAttributeTitle('Amount')).toBe('Amount');
    expect(component.getAttributeTitle('country')).toBe('country');
  });

  it('should perform case-insensitive key matching for attribute title resolution', () => {
    const attributeList = [
      createField({ key: 'unbilledUsage', title: 'Unbilled Usage' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.getAttributeTitle('unbilledUsage')).toBe('Unbilled Usage');
    expect(component.getAttributeTitle('UnbilledUsage')).toBe('Unbilled Usage');
    expect(component.getAttributeTitle('UNBILLEDUSAGE')).toBe('Unbilled Usage');
  });

  it('should ignore malformed fields and still resolve valid matching title', () => {
    const attributeList = [
      { ...createField({ key: 'available', title: 'Available' }), key: undefined as any },
      createField({ key: 'unbilledUsage', title: 'Unbilled Usage' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.getAttributeTitle('unbilledUsage')).toBe('Unbilled Usage');
  });

  it('should resolve title when field key contains extra spaces', () => {
    const attributeList = [
      createField({ key: ' unbilledUsage ', title: 'Unbilled Usage' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.getAttributeTitle('unbilledUsage')).toBe('Unbilled Usage');
  });

  it('should resolve attribute titles for conditional rules', () => {
    component.inputData = '(input1.Amount > 10) && (input1.country == "US")';
    const attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);

    component.ngOnInit();

    expect(component.ruleType).toBe(RuleTypeEnum.Conditional);
    expect(component.firstRow).toBeTruthy();
    expect(component.getAttributeString(component.firstRow)).toBe('Order Amount');
    if (component.otherRows.length > 0) {
      expect(component.getAttributeString(component.otherRows[0])).toBe('Country Name');
    }
  });

  it('should fallback to conditional type when expression input is empty', () => {
    component.inputData = '   ';
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(component.ruleType).toBe(RuleTypeEnum.Conditional);
    expect(component.compareParts).toBeNull();
    expect(component.expressions).toEqual([]);
  });

  it('should resolve compare feature flag from workflow-level shell config', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: true } as any);
    mockRuleEngineDataService.getWorkflowId.and.returnValue(1);
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(mockRuleConfigAdapter.getShellConfigForWorkflow).toHaveBeenCalledWith(1);
    expect(component.isCompareFeatureEnabled).toBeTrue();
  });

  it('should disable compare mode when workflow flag is false', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: false } as any);
    mockRuleEngineDataService.getWorkflowId.and.returnValue(1);
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(component.isCompareFeatureEnabled).toBeFalse();
  });

  it('should handle invalid workflow ID and use default shell config', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: false } as any);
    mockRuleEngineDataService.getWorkflowId.and.returnValue(-1);
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(mockRuleConfigAdapter.getShellConfigForWorkflow).toHaveBeenCalledWith(0);
    expect(component.isCompareFeatureEnabled).toBeFalse();
  });

  it('should display compare-backed expression when feature is enabled for compare rule', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: true } as any);
    component.inputData = '(input1.Amount > input1.country - input1.region)';
    component.action = 'Approve';
    const attributeList = [
      createField({ key: 'Amount', title: 'Order Amount' }),
      createField({ key: 'country', title: 'Country Name' }),
      createField({ key: 'region', title: 'Region Name' }),
    ];
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue({ attributeList } as any);
    mockRuleEngineDataService.getWorkflowId.and.returnValue(1);

    component.ngOnInit();

    expect(component.isCompareFeatureEnabled).toBeTrue();
    expect(component.ruleType).toBe(RuleTypeEnum.Compare);
    expect(component.compareParts).toBeDefined();
    expect(component.getCompareSummary()).toContain('Order Amount');
  });

  // ---- CBC cost-adjustment mode ----

  it('isCostAdjustmentMode should be false by default when shell config does not set the flag', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue({ enableCompareRuleType: false } as any);
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(component.isCostAdjustmentMode).toBeFalsy();
  });

  it('isCostAdjustmentMode should be true when shell config has costAdjustmentMode set', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue(
      { enableCompareRuleType: false, costAdjustmentMode: true } as any,
    );
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);

    component.ngOnInit();

    expect(component.isCostAdjustmentMode).toBeTrue();
  });

  it('displayActionText should format a valid cost-adjustment JSON string as CostAdjustment: N', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue(
      { enableCompareRuleType: false, costAdjustmentMode: true } as any,
    );
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);
    component.action = '{"costAdjustment":4.5}';

    component.ngOnInit();

    expect(component.displayActionText).toBe('CostAdjustment: 4.5');
  });

  it('displayActionText should format an integer cost-adjustment value', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue(
      { enableCompareRuleType: false, costAdjustmentMode: true } as any,
    );
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);
    component.action = '{"costAdjustment":7}';

    component.ngOnInit();

    expect(component.displayActionText).toBe('CostAdjustment: 7');
  });

  it('displayActionText should fall back to the raw action string when cost-adjustment mode is active but JSON is not a valid payload', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue(
      { enableCompareRuleType: false, costAdjustmentMode: true } as any,
    );
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);
    component.action = 'Approve';

    component.ngOnInit();

    expect(component.displayActionText).toBe('Approve');
  });

  it('displayActionText should return the raw action string unchanged when cost-adjustment mode is inactive', () => {
    mockRuleConfigAdapter.getShellConfigForWorkflow.and.returnValue(
      { enableCompareRuleType: false, costAdjustmentMode: false } as any,
    );
    mockRuleEngineDataService.getUIRuleConfig.and.returnValue(null);
    component.action = 'Approve';

    component.ngOnInit();

    expect(component.displayActionText).toBe('Approve');
  });
});
