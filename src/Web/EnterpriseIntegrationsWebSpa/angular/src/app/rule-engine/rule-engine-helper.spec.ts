import { DatePipe } from '@angular/common';
import { CBC_RULE_ENGINE_WORKFLOW_ID } from '../core/config/rule-engine.config';
import { RuleEngineDashboardHelper, RuleEngineExpressionHelper, RuleEngineHelper } from './rule-engine-helper';
import { RuleEditorField, UIRuleConfigApiResponse } from 'src/app/models/rule-engine/rule-editor-config.model';
import { Rule, RuleTypeEnum } from 'src/app/models/rule-engine/rule-engine';

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

describe('RuleEngineHelper', () => {
  it('should return expression attributes for selected override only', () => {
    const fields: RuleEditorField[] = [
      createField({ key: 'Country', title: 'Country', dataType: 'select', allowedOverrides: ['Country', 'CountryGroup'] }),
      createField({ key: 'ResellerName', title: 'Reseller Name', dataType: 'string', allowedOverrides: ['Reseller'] }),
      createField({ key: 'Then', title: 'Then', usedIn: 'actionBuilder', allowedOverrides: ['Country'] }),
    ];

    const result = RuleEngineHelper.getExpressionAttributesForOverride(fields, 'Country');

    expect(result).toEqual([{ label: 'Country', value: 'Country' }]);
  });

  it('should handle expression attributes when metadata uses JSON object/array payloads', () => {
    const fields: RuleEditorField[] = [
      createField({
        key: 'Country',
        title: 'Country',
        dataType: 'select',
        allowedOverrides: ['Country'],
        values: [{ label: 'Denmark', value: 'Denmark' }],
        application: { source: 'ui-config', version: 1 },
      }),
    ];

    const result = RuleEngineHelper.getExpressionAttributesForOverride(fields, 'Country');

    expect(result).toEqual([{ label: 'Country', value: 'Country' }]);
  });

  it('should return comparable expression attributes for selected override only', () => {
    const fields: RuleEditorField[] = [
      createField({ key: 'OrderValue', title: 'Order Value', dataType: 'decimal', allowedOverrides: ['Global'], isComparable: true }),
      createField({ key: 'AvailableCredit', title: 'Available Credit', dataType: 'decimal', allowedOverrides: ['Global'], isComparable: true }),
      createField({ key: 'ResellerName', title: 'Reseller Name', dataType: 'string', allowedOverrides: ['Global'], isComparable: false }),
      createField({ key: 'Then', title: 'Then', usedIn: 'actionBuilder', allowedOverrides: ['Global'], isComparable: true }),
    ];

    const result = RuleEngineHelper.getComparableExpressionAttributesForOverride(fields, 'Global');

    expect(result).toEqual([
      { label: 'Order Value', value: 'OrderValue' },
      { label: 'Available Credit', value: 'AvailableCredit' },
    ]);
  });

  it('should return distinct allowed overrides trimmed and deduplicated', () => {
    const config: UIRuleConfigApiResponse = {
      attributeList: [
        createField({ allowedOverrides: [' Country ', 'Reseller', ''] }),
        createField({ key: 'Other', allowedOverrides: ['Reseller', 'Global'] }),
      ],
      dataSource: {},
    };

    const result = RuleEngineHelper.getDistinctAllowedOverrides(config);

    expect(result).toEqual(['Country', 'Reseller', 'Global']);
  });

  it('should map attribute dropdown values without override filtering', () => {
    const values = ['Country', 'Region', 'ResellerID', 'ResellerName'];

    const countryResult = RuleEngineHelper.getAttributeDropdown(values, 'Country');
    const resellerResult = RuleEngineHelper.getAttributeDropdown(values, 'Reseller');

    expect(countryResult).toEqual(values.map((value) => ({ label: value, value })));
    expect(resellerResult).toEqual(values.map((value) => ({ label: value, value })));
  });

  it('should return empty tab list when compare feature is disabled', () => {
    const tabs = RuleEngineHelper.getRuleTypesTabList(false);

    expect(Object.keys(tabs)).toEqual([]);
    expect(tabs).toEqual({});
  });

  it('should return both conditional and compare tabs when compare feature is enabled', () => {
    const tabs = RuleEngineHelper.getRuleTypesTabList(true);

    expect(Object.keys(tabs)).toContain(RuleTypeEnum.Conditional);
    expect(Object.keys(tabs)).toContain(RuleTypeEnum.Compare);
    expect(tabs[RuleTypeEnum.Conditional]?.selected).toBeTrue();
    expect(tabs[RuleTypeEnum.Compare]?.selected).toBeFalse();
    expect(tabs[RuleTypeEnum.Conditional]?.type).toBe('filter');
    expect(tabs[RuleTypeEnum.Compare]?.type).toBe('filter');
    expect(tabs[RuleTypeEnum.Conditional]?.displayName).toBeDefined();
    expect(tabs[RuleTypeEnum.Compare]?.displayName).toBeDefined();
  });

  it('should build compare summary markup with bold decision only', () => {
    const summary = RuleEngineHelper.getCompareSummaryMarkup(
      'Order Value',
      '>',
      'Available Credit',
      '-',
      'Unbilled Usage',
      'Approve',
      {
        label: 'Region',
        value: 'EMEA',
      },
    );

    expect(summary).toBe('If Order Value is > (Available Credit - Unbilled Usage) & Region is EMEA, then <span class="s1-FW700">Approve</span>.');
  });

  it('should build API payload with default Global level and empty emails', () => {
    const payload = RuleEngineHelper.getAPIRuleformat(
      {
        name: 'Rule A',
        purpose: 'Purpose',
        override: { label: 'Global', value: 'Global' },
        levelValue: null as any,
        childForm: {
          action: { label: 'Approve', value: 'Approve' },
          expressions: [
            {
              attribute: 'Amount',
              operator: '>=',
              value: '10',
            },
          ],
        },
      } as any,
      false,
      1,
    );

    expect(payload.overrideLevelName).toBe('Global');
    expect(payload.levelValues).toEqual(['Global']);
    expect(payload.emails).toEqual([]);
    expect(payload.action).toBe('Approve');
    expect(payload.expression).toContain('(input1.Amount >= 10)');
  });

  it('should prepend criteria clause using field key from attributeList for reseller compare with Region', () => {
    const attributeList = [
      createField({ key: 'regionKey', title: 'Region', dataType: 'select', allowedOverrides: ['Reseller'] }),
      createField({ key: 'countryKey', title: 'Country', dataType: 'select', allowedOverrides: ['Reseller'] }),
    ];
    const payload = RuleEngineHelper.getAPIRuleformat(
      {
        name: 'Rule B',
        purpose: 'Purpose',
        override: { label: 'Reseller', value: 'Reseller' },
        levelValue: ['R-100'],
        childForm: {
          action: { label: 'Approve', value: 'Approve' },
          expressions: [
            {
              attribute: 'Amount',
              operator: '>=',
              value: '10',
            },
          ],
          compare: {
            criteriaType: 'Region',
            criteriaValue: { label: 'EMEA', value: 'EMEA' },
          },
        },
      } as any,
      false,
      1,
      attributeList,
    );

    expect(payload.overrideLevelName).toBe('Reseller');
    expect(payload.levelValues).toEqual(['R-100']);
    expect(payload.expression).toContain('(input1.regionKey == "EMEA")');
    expect(payload.expression).toContain('&&');
    expect(payload.expression).toContain('(input1.Amount >= 10)');
  });

  it('should prepend criteria clause using field key from attributeList for reseller compare with Country', () => {
    const attributeList = [
      createField({ key: 'regionKey', title: 'Region', dataType: 'select', allowedOverrides: ['Reseller'] }),
      createField({ key: 'countryKey', title: 'Country', dataType: 'select', allowedOverrides: ['Reseller'] }),
    ];
    const payload = RuleEngineHelper.getAPIRuleformat(
      {
        name: 'Rule C',
        purpose: 'Purpose',
        override: { label: 'Reseller', value: 'Reseller' },
        levelValue: ['R-100'],
        childForm: {
          action: { label: 'Approve', value: 'Approve' },
          expressions: [
            {
              attribute: 'Amount',
              operator: '>=',
              value: '10',
            },
          ],
          compare: {
            criteriaType: 'Country',
            criteriaValue: { label: 'Denmark', value: 'Denmark' },
          },
        },
      } as any,
      false,
      1,
      attributeList,
    );

    expect(payload.overrideLevelName).toBe('Reseller');
    expect(payload.levelValues).toEqual(['R-100']);
    expect(payload.expression).toContain('(input1.countryKey == "Denmark")');
    expect(payload.expression).toContain('&&');
    expect(payload.expression).toContain('(input1.Amount >= 10)');
  });

  it('should escape reseller criteria values containing quotes and backslashes', () => {
    const attributeList = [
      createField({ key: 'countryKey', title: 'Country', dataType: 'select', allowedOverrides: ['Reseller'] }),
    ];
    const payload = RuleEngineHelper.getAPIRuleformat(
      {
        name: 'Rule D',
        purpose: 'Purpose',
        override: { label: 'Reseller', value: 'Reseller' },
        levelValue: ['R-100'],
        childForm: {
          action: { label: 'Approve', value: 'Approve' },
          expressions: [
            {
              attribute: 'Amount',
              operator: '>=',
              value: '10',
            },
          ],
          compare: {
            criteriaType: 'Country',
            criteriaValue: { label: 'DK "Nordic" \\ Team', value: 'DK "Nordic" \\ Team' },
          },
        },
      } as any,
      false,
      1,
      attributeList,
    );

    expect(payload.expression).toContain('(input1.countryKey == "DK \\\"Nordic\\\" \\\\ Team")');
  });

  // ---- CBC cost-adjustment serialization ----

  describe('serializeCostAdjustmentAction', () => {
    it('should serialize a positive integer value to a JSON cost-adjustment string', () => {
      expect(RuleEngineHelper.serializeCostAdjustmentAction('4'))
        .toBe('{"costAdjustment":4}');
    });

    it('should serialize a positive decimal value', () => {
      expect(RuleEngineHelper.serializeCostAdjustmentAction('4.5'))
        .toBe('{"costAdjustment":4.5}');
    });

    it('should serialize a negative decimal value', () => {
      expect(RuleEngineHelper.serializeCostAdjustmentAction('-2.75'))
        .toBe('{"costAdjustment":-2.75}');
    });

    it('should return the raw value unchanged when it cannot be parsed as a finite number', () => {
      expect(RuleEngineHelper.serializeCostAdjustmentAction('not-a-number'))
        .toBe('not-a-number');
    });

    it('should return the raw value unchanged for an empty string', () => {
      expect(RuleEngineHelper.serializeCostAdjustmentAction('')).toBe('');
    });
  });

  describe('tryParseCostAdjustmentValue', () => {
    it('should extract the numeric value from a valid cost-adjustment JSON string', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{"costAdjustment":4}'))
        .toBe('4');
    });

    it('should extract a decimal value from a cost-adjustment JSON string', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{"costAdjustment":4.5}'))
        .toBe('4.5');
    });

    it('should extract a negative value from a cost-adjustment JSON string', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{"costAdjustment":-2.75}'))
        .toBe('-2.75');
    });

    it('should return null for a plain string action (non-JSON)', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('Approve')).toBeNull();
    });

    it('should return null for a JSON object that lacks the costAdjustment key', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{"someOtherKey":4}')).toBeNull();
    });

    it('should return null for a JSON object where costAdjustment is not a number', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{"costAdjustment":"four"}')).toBeNull();
    });

    it('should return null for an empty string', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('')).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{broken json')).toBeNull();
    });

    it('should return null when costAdjustment value is null', () => {
      expect(RuleEngineHelper.tryParseCostAdjustmentValue('{"costAdjustment":null}')).toBeNull();
    });
  });

  describe('formatCostAdjustmentForDisplay', () => {
    it('should format a valid cost-adjustment JSON string as CostAdjustment: N', () => {
      expect(RuleEngineHelper.formatCostAdjustmentForDisplay('{"costAdjustment":4}'))
        .toBe('CostAdjustment: 4');
    });

    it('should format a decimal cost-adjustment value', () => {
      expect(RuleEngineHelper.formatCostAdjustmentForDisplay('{"costAdjustment":4.5}'))
        .toBe('CostAdjustment: 4.5');
    });

    it('should fall back to the raw action string when the input is not a cost-adjustment payload', () => {
      expect(RuleEngineHelper.formatCostAdjustmentForDisplay('Approve'))
        .toBe('Approve');
    });

    it('should return an empty string when the input is empty', () => {
      expect(RuleEngineHelper.formatCostAdjustmentForDisplay('')).toBe('');
    });

    it('should parse valid cost-adjustment JSON even when wrapped with whitespace', () => {
      expect(RuleEngineHelper.formatCostAdjustmentForDisplay('  {"costAdjustment":4.5}  '))
        .toBe('CostAdjustment: 4.5');
    });

    it('should safely fall back to an empty string for null-like non-string inputs', () => {
      expect(RuleEngineHelper.formatCostAdjustmentForDisplay(null as any))
        .toBe('');
    });
  });

  describe('getAPIRuleformat — CBC workflow (workflowId=2)', () => {
    it('should serialize the action as a JSON cost-adjustment string for CBC workflow', () => {
      const payload = RuleEngineHelper.getAPIRuleformat(
        {
          name: 'CBC Rule',
          purpose: 'Purpose',
          override: { label: 'Global', value: 'Global' },
          levelValue: null as any,
          childForm: {
            action: '4.5',
            expressions: [{ attribute: 'Amount', operator: '>=', value: '10' }],
          },
        } as any,
        false,
        2,
      );

      expect(payload.action).toBe('{"costAdjustment":4.5}');
    });

    it('should serialize an integer action value as JSON for CBC workflow', () => {
      const payload = RuleEngineHelper.getAPIRuleformat(
        {
          name: 'CBC Rule',
          purpose: 'Purpose',
          override: { label: 'Global', value: 'Global' },
          levelValue: null as any,
          childForm: {
            action: { label: '4', value: '4' },
            expressions: [{ attribute: 'Amount', operator: '>=', value: '10' }],
          },
        } as any,
        false,
        2,
      );

      expect(payload.action).toBe('{"costAdjustment":4}');
    });

    it('should leave action unchanged for non-CBC workflow', () => {
      const payload = RuleEngineHelper.getAPIRuleformat(
        {
          name: 'C3 Rule',
          purpose: 'Purpose',
          override: { label: 'Global', value: 'Global' },
          levelValue: null as any,
          childForm: {
            action: { label: 'Approve', value: 'Approve' },
            expressions: [{ attribute: 'Amount', operator: '>=', value: '10' }],
          },
        } as any,
        false,
        1,
      );

      expect(payload.action).toBe('Approve');
    });
  });
});

describe('RuleEngineDashboardHelper', () => {
  function createDashboardRule(overrides: Partial<Rule> = {}): Rule {
    return {
      id: 'rule-1',
      createdOn: '2026-01-01T00:00:00Z',
      createdBy: 'test-user',
      updatedOn: '2026-01-01T00:00:00Z',
      updatedBy: 'test-user',
      decision: 'Approve',
      successEvent: null,
      actions: null,
      errorMessage: '',
      expression: '',
      ruleExpressionType: 0,
      localParams: null,
      operator: null,
      properties: null,
      rules: null,
      workflowsToInject: null,
      purpose: 'Purpose',
      enabled: true,
      ruleName: 'Rule Name',
      emails: [],
      ...overrides,
    };
  }

  function getDecisionFormatter(workflowId?: number): (data: Rule) => string {
    const decisionColumn = RuleEngineDashboardHelper
      .getDefaultColumns(new DatePipe('en-US'), workflowId)
      .find((column) => column.columnKey === 'Decision');

    expect(decisionColumn).toBeDefined();
    return decisionColumn!.formatter as (data: Rule) => string;
  }

  it('should fallback to successEvent for CBC when decision is undefined', () => {
    const formatter = getDecisionFormatter(CBC_RULE_ENGINE_WORKFLOW_ID);
    const html = formatter(createDashboardRule({ decision: undefined as any, successEvent: 'Approve' }));

    expect(html).toContain('Approve');
    expect(html).toContain('/assets/Approve.svg');
  });

  it('should fallback to successEvent for CBC when decision is null', () => {
    const formatter = getDecisionFormatter(CBC_RULE_ENGINE_WORKFLOW_ID);
    const html = formatter(createDashboardRule({ decision: null as any, successEvent: 'Decline' }));

    expect(html).toContain('Decline');
    expect(html).toContain('/assets/Decline.svg');
  });

  it('should fallback to successEvent for CBC when decision is empty string', () => {
    const formatter = getDecisionFormatter(CBC_RULE_ENGINE_WORKFLOW_ID);
    const html = formatter(createDashboardRule({ decision: '', successEvent: 'PendingApproval' }));

    expect(html).toContain('PendingApproval');
    expect(html).toContain('/assets/PendingApproval.svg');
  });

  it('should keep decision for CBC when decision is present', () => {
    const formatter = getDecisionFormatter(CBC_RULE_ENGINE_WORKFLOW_ID);
    const html = formatter(createDashboardRule({ decision: 'Decline', successEvent: 'Approve' }));

    expect(html).toContain('Decline');
    expect(html).not.toContain('Approve');
  });

  it('should not fallback to successEvent for non-CBC workflow', () => {
    const formatter = getDecisionFormatter(1);
    const html = formatter(createDashboardRule({ decision: '', successEvent: 'Approve' }));

    expect(html).not.toContain('Approve');
  });
});

describe('RuleEngineExpressionHelper', () => {
  it('should convert bool and select values to dropdown values in apiToUiForm', () => {
    const supportedFields: RuleEditorField[] = [
      createField({ key: 'cisDiscontinued', title: 'CIS_Discontinued', dataType: 'bool', allowedOverrides: ['Reseller'] }),
      createField({ key: 'Country', title: 'Country', dataType: 'select', allowedOverrides: ['Country'] }),
      createField({ key: 'Qty', title: 'Qty', dataType: 'int', allowedOverrides: ['Global'] }),
    ];

    const result = RuleEngineExpressionHelper.apiToUiForm(
      {
        expression: '(input1.cisDiscontinued == true) && (input1.Qty > 10)',
        action: 'Approve',
      },
      supportedFields,
    );

    expect(result.expressions.length).toBe(2);
    expect(result.expressions[0].attribute).toEqual({ label: 'CIS_Discontinued', value: 'cisDiscontinued' });
    expect(result.expressions[0].value).toEqual({ label: 'true', value: 'true' });
    expect(result.expressions[1].value).toBe('10');
    expect(result.expressions[1].logicalOperator).toBe('And');
    expect(result.action).toEqual({ label: 'Approve', value: 'Approve', imgAlt: 'Approve', imgUrl: '/assets/Approve.svg' });
  });

  it('should keep non-legacy action values while hydrating apiToUiForm', () => {
    const supportedFields: RuleEditorField[] = [
      createField({ key: 'Qty', title: 'Qty', dataType: 'int', allowedOverrides: ['Global'] }),
    ];

    const result = RuleEngineExpressionHelper.apiToUiForm(
      {
        expression: '(input1.Qty > 10)',
        action: 'PendingApproval',
      },
      supportedFields,
    );

    expect(result.action).toEqual({ label: 'PendingApproval', value: 'PendingApproval' });
  });

  it('should serialize numeric literals without quotes in uiToApi', () => {
    const expression = RuleEngineExpressionHelper.uiToApi([
      {
        attribute: { label: 'Custom', value: 'CustomAttr' },
        operator: { label: '>=', value: '>=' },
        value: '10.25',
      },
    ] as any);

    expect(expression).toBe('(input1.CustomAttr >= 10.25)');
  });

  it('should serialize boolean values in lowercase and strings in quotes in uiToApi', () => {
    const expression = RuleEngineExpressionHelper.uiToApi([
      {
        attribute: { label: 'Flag', value: 'Flag' },
        operator: { label: '==', value: '==' },
        value: 'TRUE',
      },
      {
        logicalOperator: 'And',
        attribute: { label: 'Name', value: 'Name' },
        operator: { label: '==', value: '==' },
        value: 'Reseller-A',
      },
    ] as any);

    expect(expression).toContain('(input1.Flag == true)');
    expect(expression).toContain('(input1.Name == "Reseller-A")');
  });

  it('should serialize string values with escaped quotes and backslashes in uiToApi', () => {
    const expression = RuleEngineExpressionHelper.uiToApi([
      {
        attribute: { label: 'Name', value: 'Name' },
        operator: { label: '==', value: '==' },
        value: 'DK "Nordic" \\ Team',
      },
    ] as any);

    expect(expression).toBe('(input1.Name == "DK \\\"Nordic\\\" \\\\ Team")');
  });

  it('should serialize compare operand without quotes in uiToApi', () => {
    const expression = RuleEngineExpressionHelper.uiToApi([
      {
        attribute: { label: 'Order Value', value: 'OrderValue' },
        operator: { label: '>', value: '>' },
        value: 'input1.AvailableCredit - input1.UnbilledUsage',
      },
    ] as any);

    expect(expression).toBe('(input1.OrderValue > input1.AvailableCredit - input1.UnbilledUsage)');
  });

  it('should infer compare rule type only for supported compare shape', () => {
    const compareExpression = '(input1.OrderValue > input1.AvailableCredit - input1.UnbilledUsage)';
    const conditionalExpression = '(input1.Country == "Denmark")';

    expect(RuleEngineExpressionHelper.inferRuleTypeFromExpression(compareExpression)).toBe(RuleTypeEnum.Compare);
    expect(RuleEngineExpressionHelper.inferRuleTypeFromExpression(conditionalExpression)).toBe(RuleTypeEnum.Conditional);
  });

  it('should infer compare rule type when arithmetic clause is one of many clauses', () => {
    const multiClauseCompare = '(input1.Region = "EMEA") && (input1.Amount < input1.UnbilledUsage + input1.AvailableCredit)';
    expect(RuleEngineExpressionHelper.inferRuleTypeFromExpression(multiClauseCompare)).toBe(RuleTypeEnum.Compare);
  });

  it('should parse compare parts from expression for edit-mode hydration', () => {
    const compareExpression = '(input1.OrderValue > input1.AvailableCredit - input1.UnbilledUsage)';

    const parts = RuleEngineExpressionHelper.getComparePartsFromExpression(compareExpression);

    expect(parts).toEqual({
      attr1: 'OrderValue',
      logicalOperator: '>',
      attr2: 'AvailableCredit',
      arithmeticOperator: '-',
      attr3: 'UnbilledUsage',
    });
  });

  it('should extract compare parts from multi-clause expression containing arithmetic operand', () => {
    const multiClauseCompare = '(input1.Region = "EMEA") && (input1.Amount < input1.UnbilledUsage + input1.AvailableCredit)';
    const parts = RuleEngineExpressionHelper.getComparePartsFromExpression(multiClauseCompare);
    expect(parts).toEqual({
      attr1: 'Amount',
      logicalOperator: '<',
      attr2: 'UnbilledUsage',
      arithmeticOperator: '+',
      attr3: 'AvailableCredit',
    });
  });

  it('should split compare edit expression into criteria and compare parts when logical connector exists', () => {
    const expression = '(input1.country = "India") && (input1.amount > input1.unbilledUsage + input1.available)';

    const result = RuleEngineExpressionHelper.getCompareEditHydrationFromExpression(expression);

    expect(result.hasLogicalConnector).toBeTrue();
    expect(result.compareParts).toEqual({
      attr1: 'amount',
      logicalOperator: '>',
      attr2: 'unbilledUsage',
      arithmeticOperator: '+',
      attr3: 'available',
    });
    expect(result.criteria).toEqual({
      criteriaType: 'Country',
      rawValue: 'India',
    });
  });

  it('should split compare edit expression when reseller criteria uses double equals', () => {
    const expression = '(input1.country == "Australia") && (input1.amount > input1.unbilledUsage + input1.available)';

    const result = RuleEngineExpressionHelper.getCompareEditHydrationFromExpression(expression);

    expect(result.hasLogicalConnector).toBeTrue();
    expect(result.compareParts).toEqual({
      attr1: 'amount',
      logicalOperator: '>',
      attr2: 'unbilledUsage',
      arithmeticOperator: '+',
      attr3: 'available',
    });
    expect(result.criteria).toEqual({
      criteriaType: 'Country',
      rawValue: 'Australia',
    });
  });

  it('should treat compare expression without logical connector as non-reseller compare shape', () => {
    const expression = '(input1.amount > input1.unbilledUsage + input1.available)';

    const result = RuleEngineExpressionHelper.getCompareEditHydrationFromExpression(expression);

    expect(result.hasLogicalConnector).toBeFalse();
    expect(result.compareParts).toEqual({
      attr1: 'amount',
      logicalOperator: '>',
      attr2: 'unbilledUsage',
      arithmeticOperator: '+',
      attr3: 'available',
    });
    expect(result.criteria).toBeNull();
  });

  it('should parse value containing parentheses inside a quoted string', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Note == "(A)") && (input1.Amount > 10)',
    );

    expect(result.length).toBe(2);
    expect(result[0].attribute).toBe('Note');
    expect(result[0].value).toBe('(A)');
    expect(result[1].logicalOperator).toBe('And');
  });

  it('should parse value containing escaped double-quotes', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Note == "he said \\"hello\\"") && (input1.Amount > 10)',
    );

    expect(result.length).toBe(2);
    expect(result[0].attribute).toBe('Note');
    expect(result[0].value).toBe('he said "hello"');
  });

  it('should not split clauses when symbolic connector appears inside quoted value', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Note == "A && B") && (input1.Amount > 10)',
    );

    expect(result.length).toBe(2);
    expect(result[0].attribute).toBe('Note');
    expect(result[0].value).toBe('A && B');
    expect(result[1].logicalOperator).toBe('And');
  });

  it('should not split clauses when word connector appears inside quoted value', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Note == "And") And (input1.Country == "Denmark")',
    );

    expect(result.length).toBe(2);
    expect(result[0].attribute).toBe('Note');
    expect(result[0].value).toBe('And');
    expect(result[1].logicalOperator).toBe('And');
  });

  it('should parse clauses with multi-segment attribute paths', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(tenant.env.input1.Amount <= 20) && (input1.Country == "Denmark")',
    );

    expect(result.length).toBe(2);
    expect(result[0].attribute).toBe('Amount');
    expect(result[0].operator).toBe('<=');
    expect(result[0].value).toBe('20');
    expect(result[1].logicalOperator).toBe('And');
  });

  it('should ignore malformed attribute paths when parsing clauses', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Order-Value > 10) && (input1.Country == "Denmark")',
    );

    expect(result.length).toBe(1);
    expect(result[0].attribute).toBe('Country');
    expect(result[0].value).toBe('Denmark');
  });

  it('should ignore malformed attribute paths with astral unicode characters', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Na😀me > 10) && (input1.Country == "Denmark")',
    );

    expect(result.length).toBe(1);
    expect(result[0].attribute).toBe('Country');
    expect(result[0].value).toBe('Denmark');
  });

  it('should ignore clauses where identifier starts with non-ascii character', () => {
    const result = RuleEngineExpressionHelper.apiToUi(
      '(input1.Åmount > 10) && (input1.Country == "Denmark")',
    );

    expect(result.length).toBe(1);
    expect(result[0].attribute).toBe('Country');
    expect(result[0].value).toBe('Denmark');
  });

  it('splitClauseByOperator should prefer two-character operators over one-character matches', () => {
    const split = (RuleEngineExpressionHelper as any).splitClauseByOperator('input1.Amount >= 10');

    expect(split).toEqual({ left: 'input1.Amount', operator: '>=', right: '10' });
  });

  it('splitClauseByOperator should ignore operator-like text inside quoted values', () => {
    const split = (RuleEngineExpressionHelper as any).splitClauseByOperator('input1.Note == "A>=B"');

    expect(split).toEqual({ left: 'input1.Note', operator: '==', right: '"A>=B"' });
  });

  it('splitClauseByOperator should split only on top-level operators outside nested parentheses', () => {
    const split = (RuleEngineExpressionHelper as any).splitClauseByOperator('input1.Amount > (input1.Base >= 10)');

    expect(split).toEqual({ left: 'input1.Amount', operator: '>', right: '(input1.Base >= 10)' });
  });

  it('splitClauseByOperator should return null when either side of operator is empty', () => {
    const missingLeft = (RuleEngineExpressionHelper as any).splitClauseByOperator(' >= 10');
    const missingRight = (RuleEngineExpressionHelper as any).splitClauseByOperator('input1.Amount >= ');

    expect(missingLeft).toBeNull();
    expect(missingRight).toBeNull();
  });

  it('getLastAttributePathSegment should return last segment for dot-delimited paths', () => {
    const last = (RuleEngineExpressionHelper as any).getLastAttributePathSegment('tenant.env.input1.Amount');

    expect(last).toBe('Amount');
  });

  it('getLastAttributePathSegment should return empty string for trailing-dot path segment', () => {
    const last = (RuleEngineExpressionHelper as any).getLastAttributePathSegment('input1.');

    expect(last).toBe('');
  });

  it('getCodePointAt should return -1 for out-of-range indexes', () => {
    const outOfRange = (RuleEngineExpressionHelper as any).getCodePointAt('Amount', 100);

    expect(outOfRange).toBe(-1);
  });

  it('attrKey should return value for dropdown-shaped selectable', () => {
    const key = RuleEngineExpressionHelper.attrKey({ label: 'Country', value: 'country' });

    expect(key).toBe('country');
  });

  it('attrKey should return null for empty selectable value', () => {
    const key = RuleEngineExpressionHelper.attrKey(null);

    expect(key).toBeNull();
  });
});
