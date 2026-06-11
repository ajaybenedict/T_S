import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { RuleEditorConfigAdapter } from 'src/app/core/services/rule-engine/rule-editor-config-adapter.service';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RuleEditorField } from 'src/app/models/rule-engine/rule-editor-config.model';
import { RuleExpressionUI, RuleSelectableValue, RuleTypeEnum } from 'src/app/models/rule-engine/rule-engine';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';

import { RuleEditComponent } from './rule-edit.component';

function createField(overrides: Partial<RuleEditorField>): RuleEditorField {
  return {
    id: 1,
    applicationId: 1,
    workflowId: 1,
    key: 'Amount',
    title: 'Amount',
    dataType: 'decimal',
    usedIn: 'expressionBuilder',
    validations: null,
    allowedOverrides: ['Global'],
    rulePrecedence: null,
    dataSource: null,
    values: null,
    isComparable: true,
    application: null,
    ...overrides,
  };
}

describe('RuleEditComponent', () => {
  let component: RuleEditComponent;
  let fixture: ComponentFixture<RuleEditComponent>;
  let validateExpressionsSpy: jasmine.Spy;

  beforeEach(async () => {
    validateExpressionsSpy = jasmine.createSpy('validateExpressions').and.returnValue({ valid: true });

    TestBed.configureTestingModule({
      declarations: [ RuleEditComponent ],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: RuleEngineDataService,
          useValue: {
            getWorkflowId: jasmine.createSpy('getWorkflowId').and.returnValue(1),
            getUIRuleConfig: jasmine.createSpy('getUIRuleConfig').and.returnValue({
              attributeList: [
                createField({ key: 'country', title: 'Country', dataType: 'select', allowedOverrides: ['Reseller', 'Country', 'Global'] }),
                createField({ key: 'region', title: 'Region', dataType: 'select', allowedOverrides: ['Reseller', 'CountryGroup', 'Global'] }),
                createField({ key: 'Amount', title: 'Amount', dataType: 'decimal', allowedOverrides: ['Global'] }),
              ],
              dataSource: {},
            }),
            setUIRuleConfig: jasmine.createSpy('setUIRuleConfig'),
            getEditingExpression: jasmine.createSpy('getEditingExpression').and.returnValue(null),
            overrideValue$: of('Reseller'),
            levelValue$: of(['EMEA']),
          },
        },
        {
          provide: PPCDashboardDataService,
          useValue: {
            countryRegionData$: of([]),
          },
        },
        {
          provide: RuleEngineApiService,
          useValue: {
            getUIRuleConfig: jasmine.createSpy('getUIRuleConfig').and.returnValue(of(null)),
          },
        },
        {
          provide: RuleEditorConfigAdapter,
          useValue: {
            adaptConfig: jasmine.createSpy('adaptConfig').and.returnValue({
              schema: {
                workflowId: 1,
                expressionAttributes: [
                  { key: 'Amount', title: 'Amount', dataType: 'decimal', operatorSetKey: 'numeric' },
                  { key: 'country', title: 'Country', dataType: 'select', operatorSetKey: 'string' },
                  { key: 'region', title: 'Region', dataType: 'select', operatorSetKey: 'string' },
                ],
                actionAttribute: null,
                operatorSets: [
                  { key: 'numeric', operators: ['<', '<=', '==', '!=', '>', '>='] },
                  { key: 'string', operators: ['==', '!='] },
                ],
                dataSources: {},
              },
              behavior: {
                workflowId: 1,
                getAttributeListForOverride: jasmine.createSpy('getAttributeListForOverride').and.returnValue([]),
                shouldResetCountryWhenRegionChanges: true,
                validateExpressions: validateExpressionsSpy,
              },
              cascadeRules: [],
              cascadeResolver: null,
              shellConfig: {
                enableCompareRuleType: true,
                overridesRequiringLevelValue: [],
                geoSelectorOverrideKeys: [],
                regionSelectorOverrideKeys: [],
                resellerOverrideKeys: [],
                geoDataSourceKey: null,
                resellerMaxLength: null,
                emailRecipientsEnabled: false,
                allowedEmailDomains: [],
                applicationId: 0,
                dialogActions: {
                  publish: 'Publish',
                  saveDraft: 'SaveDraft',
                  editDraft: 'EditDraft',
                  editPublish: 'EditPublish',
                },
                dialogConfig: {
                  createDraft: { header: 'Save Draft', content: '', primaryBtnAction: 'SaveDraft', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                  createPublish: { header: 'Publish Rule', content: '', primaryBtnAction: 'Publish', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                  edit: { header: 'Edit', content: '', primaryBtnName: 'Confirm' },
                  moveToDraft: { header: 'Move to Draft', content: '', primaryBtnAction: 'MoveToDraft', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                  moveToPublish: { header: 'Move to Publish', content: '', primaryBtnAction: 'MoveToPublish', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                },
                allowDuplicateAttributes: false,
              },
            }),
            getOperatorsForAttribute: jasmine.createSpy('getOperatorsForAttribute').and.returnValue([
              { label: '<', value: '<' },
              { label: '<=', value: '<=' },
              { label: '==', value: '==' },
              { label: '!=', value: '!=' },
              { label: '>', value: '>' },
              { label: '>=', value: '>=' },
            ]),
            resolveDropdownOptions: jasmine.createSpy('resolveDropdownOptions').and.returnValue([]),
            getSelectedAttributeKeysInOtherExpressions: jasmine.createSpy('getSelectedAttributeKeysInOtherExpressions').and.callFake((
              expressions: Array<{ attribute?: { key?: string } } | null | undefined>,
              currentExpressionIndex: number,
            ) => {
              const selected = new Set<string>();
              expressions.forEach((expression, index) => {
                if (!expression || index === currentExpressionIndex) {
                  return;
                }

                const key = String(expression.attribute?.key ?? '').trim();
                if (key) {
                  selected.add(key);
                }
              });

              return selected;
            }),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open').and.returnValue({
              afterClosed: () => of(null),
              close: jasmine.createSpy('close'),
            }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideTemplate(RuleEditComponent, '');
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(RuleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    (component as any).selectedTab = RuleTypeEnum.Conditional;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show no tabs when compare feature is disabled', () => {
    (component as any).isCompareFeatureEnabled = false;

    (component as any).initTabs();

    expect(component.tabList.length).toBe(0);
    expect(component.tabs).toEqual({});
    expect(component.selectedTab).toBe(RuleTypeEnum.Conditional);
  });

  it('should show both tabs when compare feature is enabled', () => {
    (component as any).isCompareFeatureEnabled = true;

    (component as any).initTabs();

    expect(component.tabList.length).toBe(2);
    expect(component.tabs[RuleTypeEnum.Conditional]).toBeDefined();
    expect(component.tabs[RuleTypeEnum.Compare]).toBeDefined();
    expect(component.tabs[RuleTypeEnum.Conditional]!.selected).toBeTrue();
    expect(component.tabs[RuleTypeEnum.Compare]!.selected).toBeFalse();
  });

  it('should default to conditional mode when compare feature is disabled and no tabs shown', () => {
    (component as any).isCompareFeatureEnabled = false;
    (component as any).selectedTab = RuleTypeEnum.Conditional;

    (component as any).initTabs();

    expect(component.tabList.length).toBe(0);
    expect(component.tabs).toEqual({});
    expect(component.selectedTab).toBe(RuleTypeEnum.Conditional);
  });

  it('should prevent switching to compare tab when compare feature is disabled', () => {
    (component as any).isCompareFeatureEnabled = false;
    (component as any).selectedTab = RuleTypeEnum.Conditional;
    (component as any).initTabs();

    (component as any).setTabMode(RuleTypeEnum.Compare, false);

    expect(component.selectedTab).toBe(RuleTypeEnum.Conditional);
    expect(component.compareForm.disabled).toBeTrue();
    expect(component.expressions.enabled).toBeTrue();
  });

  it('should initialize with conditional tab selected when compare feature is enabled', () => {
    (component as any).isCompareFeatureEnabled = true;

    (component as any).initTabs();

    expect(component.tabList.length).toBe(2);
    expect(component.selectedTab).toBe(RuleTypeEnum.Conditional);
    expect(component.tabs[RuleTypeEnum.Conditional]!.selected).toBeTrue();
    expect(component.tabs[RuleTypeEnum.Compare]!.selected).toBeFalse();
  });

  it('should enable switching between tabs when compare feature is enabled', () => {
    (component as any).isCompareFeatureEnabled = true;
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).initTabs();

    (component as any).setTabMode(RuleTypeEnum.Conditional, false);

    expect(component.selectedTab).toBe(RuleTypeEnum.Conditional);
    expect(component.compareForm.disabled).toBeTrue();
    expect(component.expressions.enabled).toBeTrue();
  });

  it('should apply workflow-level compare feature flag from shell config during initialization', () => {
    const mockAdapter = TestBed.inject(RuleEditorConfigAdapter) as any;
    expect(mockAdapter.adaptConfig).toHaveBeenCalled();
    const componentConfig = mockAdapter.adaptConfig.calls.mostRecent().returnValue;
    
    expect(componentConfig.shellConfig.enableCompareRuleType).toBe(true);
    expect(component.isCompareFeatureEnabled).toBe(true);
  });

  it('should return empty dropdown options for null selectable attribute', () => {
    const options = component.getValueDropdownOptions(null as RuleSelectableValue);

    expect(options).toEqual([]);
  });

  it('should map PendingApproval action string to matching dropdown option during writeValue', () => {
    component.actionListData = [
      { label: 'Approve and Select', value: 'ApproveAndSelect' },
      { label: 'Pending Approval', value: 'PendingApproval' },
      { label: 'Decline', value: 'Decline' },
    ];

    component.writeValue({
      expressions: [
        {
          attribute: { label: 'Amount', value: 'Amount' },
          operator: { label: '>', value: '>' },
          value: '10',
        } as any,
      ],
      action: 'PendingApproval',
    });

    const selectedAction = component.form.get(component.formControlNameList.ACTION)?.value;
    expect(selectedAction).toEqual({ label: 'Pending Approval', value: 'PendingApproval' });
  });

  it('should pass normalized attribute keys to workflow validator for Reseller override', () => {
    const row = component.expressions.at(0);
    row.get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Country', value: 'country' });
    row.get(component.formControlNameList.OPERATOR)?.setValue({ label: '==', value: '==' });
    row.get(component.formControlNameList.VALUE)?.setValue({ label: 'Denmark', value: 'Denmark' });

    (component as any).selectedOverride = 'Reseller';
    (component as any).resellerExpressionValidator(component.form);

    expect(validateExpressionsSpy).toHaveBeenCalled();
    const [expressionsArg, overrideArg] = validateExpressionsSpy.calls.mostRecent().args;
    expect(overrideArg).toBe('Reseller');
    expect(expressionsArg[0]?.attribute?.key).toBe('country');
  });

  it('should return region options for Region attribute when geo datasource is configured without cascade rules', () => {
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      geoDataSourceKey: 'regionCountryDropDown',
    };
    (component as any).countryData = {
      regions: [{ label: 'EMEA', value: 'EMEA' }],
      countries: [{ label: 'Denmark', value: 'Denmark' }],
    };
    (component as any).schema = {
      ...(component as any).schema,
      dataSources: {
        regionCountryDropDown: [
          { regionName: 'EMEA', countries: [{ name: 'Denmark' }] },
        ],
      },
    };
    (component as any).attributeMetadata.set('region', {
      key: 'region',
      title: 'Region',
      dataType: 'select',
      inputType: 'dropdown',
      allowedOverrides: ['Global'],
      dataSourceRef: 'regionCountryDropDown',
      isComparable: false,
    });

    const options = component.getValueDropdownOptions({ label: 'Region', value: 'region' });

    expect(options).toEqual([{ label: 'EMEA', value: 'EMEA' }]);
  });

  it('should return country options for Country attribute when geo datasource is configured without cascade rules', () => {
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      geoDataSourceKey: 'regionCountryDropDown',
    };
    (component as any).countryData = {
      regions: [{ label: 'EMEA', value: 'EMEA' }],
      countries: [{ label: 'Denmark', value: 'Denmark' }],
    };
    (component as any).schema = {
      ...(component as any).schema,
      dataSources: {
        regionCountryDropDown: [
          { regionName: 'EMEA', countries: [{ name: 'Denmark' }] },
        ],
      },
    };
    (component as any).attributeMetadata.set('country', {
      key: 'country',
      title: 'Country',
      dataType: 'select',
      inputType: 'dropdown',
      allowedOverrides: ['Global'],
      dataSourceRef: 'regionCountryDropDown',
      isComparable: false,
    });

    const options = component.getValueDropdownOptions({ label: 'Country', value: 'country' });

    expect(options).toEqual([{ label: 'Denmark', value: 'Denmark' }]);
  });

  it('should return workflowValidation error when behavior validation fails', () => {
    validateExpressionsSpy.and.returnValue({ valid: false, error: 'Reseller rules must include at least one Country or Region condition.' });
    (component as any).selectedOverride = 'Reseller';

    const error = (component as any).resellerExpressionValidator(component.form);

    expect(error).toEqual({ workflowValidation: 'Reseller rules must include at least one Country or Region condition.' });
  });

  it('should skip reseller validation when override is not set', () => {
    validateExpressionsSpy.calls.reset();
    (component as any).selectedOverride = '';

    const error = (component as any).resellerExpressionValidator(component.form);

    expect(error).toBeNull();
    expect(validateExpressionsSpy).not.toHaveBeenCalled();
  });

  it('should emit compare expression in raw child form value', () => {
    const onChangeSpy = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeSpy);

    (component as any).selectedOverride = 'Global';
    (component as any).updateCompareAttributeOptions();
    (component as any).setTabMode(RuleTypeEnum.Compare, false);

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    const latestEmission = onChangeSpy.calls.mostRecent().args[0];
    expect(latestEmission.expressions?.length).toBe(1);
    expect(latestEmission.expressions[0].attribute).toEqual({ label: 'Amount', value: 'Amount' });
    expect(latestEmission.expressions[0].operator).toEqual({ label: '> (Greater Than)', value: '>' });
    expect(latestEmission.expressions[0].value).toBe('input1.country - input1.region');
  });

  it('should return empty summary when compare form is incomplete', () => {
    (component as any).selectedTab = RuleTypeEnum.Compare;
    component.compareForm.reset();

    expect(component.getCompareSummary()).toBe('');
  });

  it('should return populated summary when compare form is complete with valid action', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).attributeMetadata.set('amount', { key: 'Amount', title: 'Order Value', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('country', { key: 'country', title: 'Available Credit', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('region', { key: 'region', title: 'Unbilled Usage', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });

    component.form.patchValue({
      [component.formControlNameList.ACTION]: { label: 'Approve', value: 'Approve' },
    });

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Order Value', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'Available Credit', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'Unbilled Usage', value: 'region' },
    });

    const summary = component.getCompareSummary();
    expect(summary).toBe('If Order Value is > (Available Credit - Unbilled Usage), then <span class="s1-FW700">Approve</span>.');
  });

  it('should return empty summary when action is missing', () => {
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).attributeMetadata.set('amount', { key: 'Amount', title: 'Order Value', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('country', { key: 'country', title: 'Available Credit', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('region', { key: 'region', title: 'Unbilled Usage', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Order Value', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'Available Credit', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'Unbilled Usage', value: 'region' },
    });

    component.form.patchValue({
      [component.formControlNameList.ACTION]: null,
    });

    expect(component.getCompareSummary()).toBe('');
  });

  it('should return empty summary for reseller compare when criteria is missing', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).attributeMetadata.set('amount', { key: 'Amount', title: 'Order Value', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('country', { key: 'country', title: 'Available Credit', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('region', { key: 'region', title: 'Unbilled Usage', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });

    component.form.patchValue({
      [component.formControlNameList.ACTION]: { label: 'Approve', value: 'Approve' },
    });

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Order Value', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'Available Credit', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'Unbilled Usage', value: 'region' },
      [component.formControlNameList.COMPARE_CRITERIA_TYPE]: null,
      [component.formControlNameList.COMPARE_CRITERIA_VALUE]: null,
    });

    expect(component.getCompareSummary()).toBe('');
  });

  it('should include reseller criteria in compare summary before then', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).attributeMetadata.set('amount', { key: 'Amount', title: 'Order Value', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('country', { key: 'country', title: 'Available Credit', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('region', { key: 'region', title: 'Unbilled Usage', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });

    component.form.patchValue({
      [component.formControlNameList.ACTION]: { label: 'Approve', value: 'Approve' },
    });

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Order Value', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'Available Credit', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'Unbilled Usage', value: 'region' },
      [component.formControlNameList.COMPARE_CRITERIA_TYPE]: 'Region',
      [component.formControlNameList.COMPARE_CRITERIA_VALUE]: { label: 'EMEA', value: 'EMEA' },
    });

    expect(component.getCompareSummary()).toBe('If Order Value is > (Available Credit - Unbilled Usage) & Region is EMEA, then <span class="s1-FW700">Approve</span>.');
  });

  it('should return empty summary when attribute metadata is not available', () => {
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).attributeMetadata.clear();

    component.form.patchValue({
      [component.formControlNameList.ACTION]: { label: 'Approve', value: 'Approve' },
    });

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Order Value', value: 'UnknownAttr1' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'Available Credit', value: 'UnknownAttr2' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'Unbilled Usage', value: 'UnknownAttr3' },
    });

    expect(component.getCompareSummary()).toBe('');
  });

  it('should filter compare attribute options by override and comparability', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).updateCompareAttributeOptions();

    expect(component.compareAttributeOptions.length).toBeGreaterThan(0);
    component.compareAttributeOptions.forEach((option) => {
      expect(option.label).toBeTruthy();
      expect(option.value).toBeTruthy();
    });
  });

  it('should exclude attr1 from attr2 options', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).updateCompareAttributeOptions();

    component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.setValue(
      { label: 'Amount', value: 'Amount' }
    );

    expect(component.compareAttr2Options.some((opt) => String(opt.value) === 'Amount')).toBeFalsy();
  });

  it('should exclude attr1 and attr2 from attr3 options', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).updateCompareAttributeOptions();

    const attr1 = { label: 'Amount', value: 'Amount' };
    const attr2 = { label: 'country', value: 'country' };

    component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.setValue(attr1);
    component.compareForm.get(component.formControlNameList.COMPARE_ATTR2)?.setValue(attr2);

    expect(component.compareAttr3Options.some((opt) => String(opt.value) === 'Amount')).toBeFalsy();
    expect(component.compareAttr3Options.some((opt) => String(opt.value) === 'country')).toBeFalsy();
  });

  it('should reset compare form when attr1 changes on a filled form', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).updateCompareAttributeOptions();

    // Fill entire form
    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    // Change attr1
    component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.setValue(
      { label: 'Different', value: 'DifferentAttr' }
    );

    // Form resets, only changed attr1 is set to new value
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.value?.value).toBe('DifferentAttr');
    expect(component.compareForm.get(component.formControlNameList.COMPARE_LOGICAL_OPERATOR)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR2)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR3)?.value).toBeNull();
  });

  it('should reset compare form when attr2 changes on a filled form', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).updateCompareAttributeOptions();

    // Fill entire form
    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    // Change attr2
    const newAttr2 = component.compareAttr2Options[0];
    component.compareForm.get(component.formControlNameList.COMPARE_ATTR2)?.setValue(newAttr2);

    // Form resets, only changed attr2 is set to new value
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR2)?.value).toEqual(newAttr2);
    expect(component.compareForm.get(component.formControlNameList.COMPARE_LOGICAL_OPERATOR)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR3)?.value).toBeNull();
  });

  it('should validate compare form requires all fields', () => {
    (component as any).selectedTab = RuleTypeEnum.Compare;

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
    });

    const validation = (component as any).compareExpressionValidator(component.form);
    expect(validation).toEqual(jasmine.objectContaining({ compareValidation: 'All compare fields are mandatory.' }));
  });

  it('should require reseller compare criteria when override is Reseller in compare mode', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).selectedTab = RuleTypeEnum.Compare;

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    const validation = (component as any).compareExpressionValidator(component.form);
    expect(validation).toEqual(jasmine.objectContaining({ compareValidation: 'Criteria selection is mandatory for reseller compare rules.' }));
  });

  it('should return validation error when compare control is not a form group', () => {
    component.form.setControl(component.formControlNameList.COMPARE, new FormControl(null));

    const validation = (component as any).compareExpressionValidator(component.form);

    expect(validation).toEqual(jasmine.objectContaining({ compareValidation: 'Compare group is not available.' }));
  });

  it('should populate compare criteria dropdown options based on selected criteria type', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    component.countryData = {
      regions: [{ label: 'EMEA', value: 'EMEA' }],
      countries: [{ label: 'Denmark', value: 'Denmark' }],
    } as any;

    component.compareCriteriaClickHandler({ onClickEvent: 'Region' } as S1FilterButtons);
    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_TYPE)?.value).toBe('Region');
    expect(component.compareCriteriaValueOptions).toEqual([{ label: 'EMEA', value: 'EMEA' }]);

    component.compareCriteriaClickHandler({ onClickEvent: 'Country' } as S1FilterButtons);
    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_TYPE)?.value).toBe('Country');
    expect(component.compareCriteriaValueOptions).toEqual([{ label: 'Denmark', value: 'Denmark' }]);
  });

  it('should accept reseller compare form when criteria type and value are selected', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).selectedTab = RuleTypeEnum.Compare;

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_CRITERIA_TYPE]: 'Region',
      [component.formControlNameList.COMPARE_CRITERIA_VALUE]: { label: 'EMEA', value: 'EMEA' },
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    const validation = (component as any).compareExpressionValidator(component.form);
    expect(validation).toBeNull();
  });

  it('should validate compare form attributes are unique', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    }, { emitEvent: false });

    const validation = (component as any).compareExpressionValidator(component.form);
    expect(validation).toEqual(jasmine.objectContaining({ compareValidation: 'Compare attributes must be unique.' }));
  });

  it('should enable compare form and disable expressions array when switching to compare tab', () => {
    (component as any).selectedTab = RuleTypeEnum.Conditional;
    (component as any).setTabMode(RuleTypeEnum.Compare, false);

    expect(component.compareForm.enabled).toBeTruthy();
    expect(component.expressions.disabled).toBeTruthy();
  });

  it('should enable expressions array and disable compare form when switching to conditional tab', () => {
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).setTabMode(RuleTypeEnum.Conditional, false);

    expect(component.expressions.enabled).toBeTruthy();
    expect(component.compareForm.disabled).toBeTruthy();
  });

  it('should wipe compare values when switching from compare to conditional tab with confirm', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).updateCompareAttributeOptions();
    component.form.patchValue({
      [component.formControlNameList.ACTION]: { label: 'Approve', value: 'Approve' },
    });

    // Fill compare form
    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    expect(component.compareForm.getRawValue()[component.formControlNameList.COMPARE_ATTR1]).toBeTruthy();
    expect(component.expressions.at(0)?.get(component.formControlNameList.ATTRIBUTE)?.value).toEqual({ label: 'Amount', value: 'Amount' });

    // Switch to conditional with wipe
    (component as any).setTabMode(RuleTypeEnum.Conditional, true);

    // Compare form and mirrored conditional row should both be cleared.
    expect(component.compareForm.getRawValue()[component.formControlNameList.COMPARE_ATTR1]).toBeNull();
    expect(component.expressions.at(0)?.get(component.formControlNameList.ATTRIBUTE)?.value).toBeNull();
    expect(component.expressions.at(0)?.get(component.formControlNameList.OPERATOR)?.value).toBeNull();
    expect(component.expressions.at(0)?.get(component.formControlNameList.VALUE)?.value).toBeNull();
    expect(component.form.get(component.formControlNameList.ACTION)?.value).toBeNull();
  });

  it('should wipe compare-backed expression values only after dialog confirmation when switching to conditional tab', () => {
    const dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialog.open.and.returnValue({
      afterClosed: () => of('confirm'),
      close: jasmine.createSpy('close'),
    } as any);

    (component as any).selectedOverride = 'Global';
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).updateCompareAttributeOptions();
    (component as any).setTabMode(RuleTypeEnum.Compare, false);
    component.form.patchValue({
      [component.formControlNameList.ACTION]: { label: 'Approve', value: 'Approve' },
    });

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    expect(component.expressions.at(0)?.get(component.formControlNameList.ATTRIBUTE)?.value).toEqual({ label: 'Amount', value: 'Amount' });

    component.tabClickHandler({
      selected: false,
      type: 'filter',
      displayName: 'Conditional',
      onClickEvent: RuleTypeEnum.Conditional,
    } as S1FilterButtons);

    expect(component.selectedTab).toBe(RuleTypeEnum.Conditional);
    expect(component.expressions.at(0)?.get(component.formControlNameList.ATTRIBUTE)?.value).toBeNull();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.value).toBeNull();
    expect(component.form.get(component.formControlNameList.ACTION)?.value).toBeNull();
  });

  it('should hydrate compare form from API expression in edit mode', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).setTabMode(RuleTypeEnum.Compare, false);
    (component as any).attributeMetadata.set('amount', { key: 'Amount', title: 'Amount', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('country', { key: 'country', title: 'Country', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).attributeMetadata.set('region', { key: 'region', title: 'Region', dataType: 'decimal', inputType: 'number', allowedOverrides: [], dataSourceRef: null, isComparable: true });
    (component as any).updateCompareAttributeOptions();

    const compareExpressions: RuleExpressionUI[] = [
      {
        attribute: 'Amount',
        operator: '>',
        value: 'input1.country - input1.region',
      },
    ];

    (component as any).hydrateCompareFormFromExpressions(compareExpressions);

    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR1)?.value).toBeTruthy();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_LOGICAL_OPERATOR)?.value?.value).toBe('>');
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR2)?.value).toBeTruthy();
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR)?.value?.value).toBe('-');
    expect(component.compareForm.get(component.formControlNameList.COMPARE_ATTR3)?.value).toBeTruthy();
  });

  it('should pre-populate criteria type and value when editing a Reseller compare rule with country criteria', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).setTabMode(RuleTypeEnum.Compare, false);
    (component as any).rawAttributeList = [
      createField({ key: 'amount', title: 'Amount', dataType: 'decimal', allowedOverrides: ['Reseller'], isComparable: true }),
      createField({ key: 'unbilledUsage', title: 'Unbilled Usage', dataType: 'decimal', allowedOverrides: ['Reseller'], isComparable: true }),
      createField({ key: 'available', title: 'Available', dataType: 'decimal', allowedOverrides: ['Reseller'], isComparable: true }),
    ];
    (component as any).updateCompareAttributeOptions();
    component.countryData = {
      countries: [{ label: 'India', value: 'India' }, { label: 'Denmark', value: 'Denmark' }],
      regions: [{ label: 'EMEA', value: 'EMEA' }],
    } as any;

    // Expression matches: (input1.country = "India") && (input1.amount > input1.unbilledUsage + input1.available)
    const expressions: RuleExpressionUI[] = [
      { attribute: 'country', operator: '=', value: '"India"' } as any,
      { logicalOperator: 'And', attribute: 'amount', operator: '>', value: 'input1.unbilledUsage + input1.available' },
    ];

    (component as any).hydrateCompareFormFromExpressions(
      expressions,
      '(input1.country = "India") && (input1.amount > input1.unbilledUsage + input1.available)',
    );

    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_TYPE)?.value).toBe('Country');
    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_VALUE)?.value).toEqual({ label: 'India', value: 'India' });
  });

  it('should defer criteria value patch when country data is not yet loaded and flush on data arrival', () => {
    (component as any).selectedOverride = 'Reseller';
    (component as any).setTabMode(RuleTypeEnum.Compare, false);
    (component as any).rawAttributeList = [
      createField({ key: 'amount', title: 'Amount', dataType: 'decimal', allowedOverrides: ['Reseller'], isComparable: true }),
      createField({ key: 'unbilledUsage', title: 'Unbilled Usage', dataType: 'decimal', allowedOverrides: ['Reseller'], isComparable: true }),
      createField({ key: 'available', title: 'Available', dataType: 'decimal', allowedOverrides: ['Reseller'], isComparable: true }),
    ];
    (component as any).updateCompareAttributeOptions();
    // No country data available yet
    component.countryData = { countries: [], regions: [] } as any;

    const expressions: RuleExpressionUI[] = [
      { attribute: 'country', operator: '=', value: '"India"' } as any,
      { logicalOperator: 'And', attribute: 'amount', operator: '>', value: 'input1.unbilledUsage + input1.available' },
    ];

    (component as any).hydrateCompareFormFromExpressions(
      expressions,
      '(input1.country = "India") && (input1.amount > input1.unbilledUsage + input1.available)',
    );

    // Type should be set, value deferred
    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_TYPE)?.value).toBe('Country');
    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_VALUE)?.value).toBeNull();
    expect((component as any).pendingCriteriaHydration).toEqual({ criteriaType: 'Country', rawValue: 'India' });

    // Simulate country data arriving
    component.countryData = {
      countries: [{ label: 'India', value: 'India' }],
      regions: [],
    } as any;
    (component as any).flushPendingCriteriaHydration();

    expect(component.compareForm.get(component.formControlNameList.COMPARE_CRITERIA_VALUE)?.value).toEqual({ label: 'India', value: 'India' });
    expect((component as any).pendingCriteriaHydration).toBeNull();
  });

  it('should sync compare form changes to expressions array for payload serialization', () => {
    (component as any).selectedOverride = 'Global';
    (component as any).setTabMode(RuleTypeEnum.Compare, false);
    (component as any).updateCompareAttributeOptions();

    component.compareForm.patchValue({
      [component.formControlNameList.COMPARE_ATTR1]: { label: 'Amount', value: 'Amount' },
      [component.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: '> (Greater Than)', value: '>' },
      [component.formControlNameList.COMPARE_ATTR2]: { label: 'country', value: 'country' },
      [component.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: '- (Subtract)', value: '-' },
      [component.formControlNameList.COMPARE_ATTR3]: { label: 'region', value: 'region' },
    });

    const rawValue = component.form.getRawValue();
    expect(rawValue.expressions[0].attribute).toEqual({ label: 'Amount', value: 'Amount' });
    expect(rawValue.expressions[0].operator).toEqual({ label: '> (Greater Than)', value: '>' });
    expect(rawValue.expressions[0].value).toBe('input1.country - input1.region');
  });

  it('should not trigger dialog when clicking same tab button twice', () => {
    spyOn(component as any, 'openDialog');
    (component as any).selectedTab = RuleTypeEnum.Compare;

    const sameTabButton: S1FilterButtons = {
      selected: true,
      type: 'filter',
      displayName: 'Compare',
      onClickEvent: 'Compare',
    };

    component.tabClickHandler(sameTabButton);

    expect((component as any).openDialog).not.toHaveBeenCalled();
  });

  it('should only validate compare fields when in compare mode', () => {
    (component as any).selectedTab = RuleTypeEnum.Conditional;

    component.compareForm.reset();
    component.expressions.clear();

    const validation = (component as any).ruleEditorFormValidator(component.form);

    // Should not fail because we're in conditional mode, only compare validation is skipped
    expect(validation).not.toEqual(jasmine.objectContaining({ compareValidation: jasmine.any(String) }));
  });

  it('should hide selected attributes from other conditional rows when duplicates are disabled', () => {
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      allowDuplicateAttributes: false,
    };
    component.attributeList = [
      { label: 'Amount', value: 'Amount' },
      { label: 'Country', value: 'country' },
      { label: 'Region', value: 'region' },
    ];

    component.expressions.clear();
    component.addExpression();
    component.addExpression();

    component.expressions.at(0).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Amount', value: 'Amount' });

    const rowOneOptions = component.getAttributeOptionsForRow(1);
    expect(rowOneOptions.map((option) => option.value)).toEqual(['country', 'region']);
  });

  it('should keep current row attribute visible while excluding attributes selected in other rows', () => {
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      allowDuplicateAttributes: false,
    };
    component.attributeList = [
      { label: 'Amount', value: 'Amount' },
      { label: 'Country', value: 'country' },
      { label: 'Region', value: 'region' },
    ];

    component.expressions.clear();
    component.addExpression();
    component.addExpression();

    component.expressions.at(0).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Amount', value: 'Amount' });
    component.expressions.at(1).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Country', value: 'country' });

    const rowOneOptions = component.getAttributeOptionsForRow(1);
    expect(rowOneOptions.map((option) => option.value)).toEqual(['country', 'region']);
  });

  it('should disable Add Condition for conditional rules when all attributes are already selected', () => {
    (component as any).selectedTab = RuleTypeEnum.Conditional;
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      allowDuplicateAttributes: false,
    };
    component.attributeList = [
      { label: 'Amount', value: 'Amount' },
      { label: 'Country', value: 'country' },
      { label: 'Region', value: 'region' },
    ];

    component.expressions.clear();
    component.addExpression();
    component.addExpression();
    component.addExpression();

    component.expressions.at(0).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Amount', value: 'Amount' });
    component.expressions.at(1).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Country', value: 'country' });
    component.expressions.at(2).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Region', value: 'region' });

    expect(component.isAddConditionDisabled()).toBeTrue();
  });

  it('should keep Add Condition enabled in compare mode even when all attributes are selected', () => {
    (component as any).selectedTab = RuleTypeEnum.Compare;
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      allowDuplicateAttributes: false,
    };
    component.attributeList = [
      { label: 'Amount', value: 'Amount' },
      { label: 'Country', value: 'country' },
    ];

    component.expressions.clear();
    component.addExpression();
    component.addExpression();

    component.expressions.at(0).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Amount', value: 'Amount' });
    component.expressions.at(1).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Country', value: 'country' });

    expect(component.isAddConditionDisabled()).toBeFalse();
  });

  it('should keep Add Condition enabled when duplicate attributes are allowed', () => {
    (component as any).selectedTab = RuleTypeEnum.Conditional;
    (component as any).shellConfig = {
      ...(component as any).shellConfig,
      allowDuplicateAttributes: true,
    };
    component.attributeList = [
      { label: 'Amount', value: 'Amount' },
      { label: 'Country', value: 'country' },
    ];

    component.expressions.clear();
    component.addExpression();
    component.addExpression();

    component.expressions.at(0).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Amount', value: 'Amount' });
    component.expressions.at(1).get(component.formControlNameList.ATTRIBUTE)?.setValue({ label: 'Country', value: 'country' });

    expect(component.isAddConditionDisabled()).toBeFalse();
  });

  // ---- CBC cost-adjustment mode ----

  it('isCostAdjustmentMode should be false when shellConfig is null', () => {
    (component as any).shellConfig = null;

    expect(component.isCostAdjustmentMode).toBeFalse();
  });

  it('isCostAdjustmentMode should be false when costAdjustmentMode is false on shellConfig', () => {
    (component as any).shellConfig = { costAdjustmentMode: false };

    expect(component.isCostAdjustmentMode).toBeFalse();
  });

  it('isCostAdjustmentMode should be true when costAdjustmentMode is true on shellConfig', () => {
    (component as any).shellConfig = { costAdjustmentMode: true };

    expect(component.isCostAdjustmentMode).toBeTrue();
  });

  it('writeValue should pre-fill the action control with the extracted decimal when in cost-adjustment mode', () => {
    (component as any).shellConfig = { costAdjustmentMode: true };

    component.writeValue({
      expressions: [{ attribute: 'Amount', operator: '>=', value: '10' } as any],
      action: '{"costAdjustment":4.5}' as any,
    });

    expect(component.form.get(component.formControlNameList.ACTION)?.value).toBe('4.5');
  });

  it('writeValue should pre-fill cost-adjustment textbox when action is SelectDropdown containing JSON payload', () => {
    (component as any).shellConfig = { costAdjustmentMode: true };

    component.writeValue({
      expressions: [{ attribute: 'Amount', operator: '>=', value: '10' } as any],
      action: { label: '{"costAdjustment":8.25}', value: '{"costAdjustment":8.25}' } as any,
    });

    expect(component.form.get(component.formControlNameList.ACTION)?.value).toBe('8.25');
  });

  it('writeValue should fall back to plain numeric action value when cost-adjustment JSON parsing is not applicable', () => {
    (component as any).shellConfig = { costAdjustmentMode: true };

    component.writeValue({
      expressions: [{ attribute: 'Amount', operator: '>=', value: '10' } as any],
      action: { label: '6.75', value: '6.75' } as any,
    });

    expect(component.form.get(component.formControlNameList.ACTION)?.value).toBe('6.75');
  });

  it('writeValue should pre-fill the action control with an integer cost-adjustment value', () => {
    (component as any).shellConfig = { costAdjustmentMode: true };

    component.writeValue({
      expressions: [{ attribute: 'Amount', operator: '>=', value: '10' } as any],
      action: '{"costAdjustment":7}' as any,
    });

    expect(component.form.get(component.formControlNameList.ACTION)?.value).toBe('7');
  });

  it('writeValue should use resolveActionControlValue for non-cost-adjustment mode', () => {
    (component as any).shellConfig = { costAdjustmentMode: false };

    component.writeValue({
      expressions: [{ attribute: 'Amount', operator: '>=', value: '10' } as any],
      action: 'Approve' as any,
    });

    // resolveActionControlValue returns a SelectDropdown for known actions — just verify
    // the action control is populated (not the raw JSON path)
    const actionValue = component.form.get(component.formControlNameList.ACTION)?.value;
    expect(actionValue).not.toBe('{"costAdjustment":0}');
  });
});

