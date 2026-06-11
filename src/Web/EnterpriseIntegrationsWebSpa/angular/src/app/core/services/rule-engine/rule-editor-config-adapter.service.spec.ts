import { RuleEditorConfigAdapter, WorkflowBehaviorRegistry } from './rule-editor-config-adapter.service';
import { NormalizedAttribute } from 'src/app/models/rule-engine/rule-editor-config.model';
import { C3_RULE_ENGINE_WORKFLOW_ID, CBC_RULE_ENGINE_WORKFLOW_ID } from 'src/app/core/config/rule-engine.config';

describe('RuleEditorConfigAdapter', () => {
  let adapter: RuleEditorConfigAdapter;

  beforeEach(() => {
    adapter = new RuleEditorConfigAdapter(new WorkflowBehaviorRegistry());
  });

  it('should resolve options from inline JSON object datasource with actionDropDown', () => {
    const options = adapter.resolveDropdownOptions(
      '  {"actionDropDown":[{"label":"Approve","value":"Approve"}]}  ',
      {},
    );

    expect(options).toEqual([{ label: 'Approve', value: 'Approve' }]);
  });

  it('should resolve options from inline JSON array datasource', () => {
    const options = adapter.resolveDropdownOptions(
      '  [{"label":"EMEA","value":"EMEA"}]  ',
      {},
    );

    expect(options).toEqual([{ label: 'EMEA', value: 'EMEA' }]);
  });

  // ============================================================================
  // getAvailableAttributesForExpression Tests
  // ============================================================================

  describe('getAvailableAttributesForExpression', () => {
    let mockAttributes: NormalizedAttribute[];

    beforeEach(() => {
      mockAttributes = [
        {
          key: 'Country',
          title: 'Country',
          dataType: 'select',
          inputType: 'dropdown',
          allowedOverrides: [],
          dataSourceRef: null,
          isComparable: true,
        },
        {
          key: 'Region',
          title: 'Region',
          dataType: 'select',
          inputType: 'dropdown',
          allowedOverrides: [],
          dataSourceRef: null,
          isComparable: true,
        },
        {
          key: 'Amount',
          title: 'Amount',
          dataType: 'int',
          inputType: 'number',
          allowedOverrides: [],
          dataSourceRef: null,
          isComparable: true,
        },
      ];
    });

    it('should return all attributes when allowDuplicateAttributes is true', () => {
      const selectedInOthers = new Set(['Country']);

      const result = adapter.getAvailableAttributesForExpression(
        mockAttributes,
        true,
        selectedInOthers
      );

      expect(result).toEqual(mockAttributes);
      expect(result.length).toBe(3);
    });

    it('should filter out selected attributes when allowDuplicateAttributes is false', () => {
      const selectedInOthers = new Set(['Country']);

      const result = adapter.getAvailableAttributesForExpression(
        mockAttributes,
        false,
        selectedInOthers
      );

      expect(result.length).toBe(2);
      expect(result.map((a) => a.key)).not.toContain('Country');
      expect(result.map((a) => a.key)).toEqual(['Region', 'Amount']);
    });

    it('should filter multiple attributes when allowDuplicateAttributes is false', () => {
      const selectedInOthers = new Set(['Country', 'Region']);

      const result = adapter.getAvailableAttributesForExpression(
        mockAttributes,
        false,
        selectedInOthers
      );

      expect(result.length).toBe(1);
      expect(result.map((a) => a.key)).toEqual(['Amount']);
    });

    it('should return all attributes when no attributes are selected in others', () => {
      const selectedInOthers = new Set<string>();

      const result = adapter.getAvailableAttributesForExpression(
        mockAttributes,
        false,
        selectedInOthers
      );

      expect(result).toEqual(mockAttributes);
    });

    it('should return empty array when all attributes are selected elsewhere', () => {
      const selectedInOthers = new Set(['Country', 'Region', 'Amount']);

      const result = adapter.getAvailableAttributesForExpression(
        mockAttributes,
        false,
        selectedInOthers
      );

      expect(result.length).toBe(0);
    });

    it('should handle empty attributes array', () => {
      const result = adapter.getAvailableAttributesForExpression(
        [],
        false,
        new Set(['Country'])
      );

      expect(result).toEqual([]);
    });

    it('should be case-sensitive when filtering attributes', () => {
      const selectedInOthers = new Set(['country']); // lowercase

      const result = adapter.getAvailableAttributesForExpression(
        mockAttributes,
        false,
        selectedInOthers
      );

      // Country (capital C) should not be filtered out
      expect(result.length).toBe(3);
    });
  });

  // ============================================================================
  // getSelectedAttributeKeysInOtherExpressions Tests
  // ============================================================================

  describe('getSelectedAttributeKeysInOtherExpressions', () => {
    it('should return empty set when no expressions are provided', () => {
      const result = adapter.getSelectedAttributeKeysInOtherExpressions([], 0);

      expect(result.size).toBe(0);
    });

    it('should exclude current expression from collection', () => {
      const expressions = [
        { attribute: { key: 'Country' } },
        { attribute: { key: 'Region' } },
        { attribute: { key: 'Amount' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      expect(result).toEqual(new Set(['Country', 'Amount']));
      expect(result.has('Region')).toBeFalse();
    });

    it('should collect keys from all expressions except current', () => {
      const expressions = [
        { attribute: { key: 'Country' } },
        { attribute: { key: 'Region' } },
        { attribute: { key: 'Amount' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);

      expect(result).toEqual(new Set(['Region', 'Amount']));
    });

    it('should handle null expressions in array', () => {
      const expressions: Array<any> = [
        { attribute: { key: 'Country' } },
        null,
        { attribute: { key: 'Region' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);

      expect(result).toEqual(new Set(['Region']));
    });

    it('should handle undefined expressions in array', () => {
      const expressions: Array<any> = [
        { attribute: { key: 'Country' } },
        undefined,
        { attribute: { key: 'Region' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);

      expect(result).toEqual(new Set(['Region']));
    });

    it('should handle expressions with missing attribute property', () => {
      const expressions: Array<any> = [
        { attribute: { key: 'Country' } },
        { }, // missing attribute
        { attribute: { key: 'Region' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      expect(result).toEqual(new Set(['Country', 'Region']));
    });

    it('should handle expressions with missing key property', () => {
      const expressions: Array<any> = [
        { attribute: { key: 'Country' } },
        { attribute: {} }, // missing key
        { attribute: { key: 'Region' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      expect(result).toEqual(new Set(['Country', 'Region']));
    });

    it('should trim whitespace from attribute keys', () => {
      const expressions = [
        { attribute: { key: '  Country  ' } },
        { attribute: { key: 'Region' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      expect(result.has('Country')).toBeTrue();
      expect(result.has('  Country  ')).toBeFalse();
    });

    it('should ignore empty string keys after trimming', () => {
      const expressions: Array<any> = [
        { attribute: { key: 'Country' } },
        { attribute: { key: '   ' } }, // whitespace only
        { attribute: { key: 'Region' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);

      expect(result).toEqual(new Set(['Region']));
    });

    it('should work correctly when current index is the last expression', () => {
      const expressions = [
        { attribute: { key: 'Country' } },
        { attribute: { key: 'Region' } },
        { attribute: { key: 'Amount' } },
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 2);

      expect(result).toEqual(new Set(['Country', 'Region']));
    });

    it('should handle single expression array when current index is 0', () => {
      const expressions = [{ attribute: { key: 'Country' } }];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);

      expect(result.size).toBe(0);
    });

    it('should work with edit mode where expressions are mixed with new additions', () => {
      const expressions = [
        { attribute: { key: 'Country' } },
        null, // newly added, not yet filled
        { attribute: { key: 'Amount' } },
        undefined, // another new entry
      ];

      const result = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      expect(result).toEqual(new Set(['Country', 'Amount']));
    });
  });

  // ============================================================================
  // Integration Tests: Duplicate Filtering with Override Filtering
  // ============================================================================

  describe('Duplicate Filtering Integration with Override-Based Filtering', () => {
    let mockNormalizedAttributes: NormalizedAttribute[];

    beforeEach(() => {
      // Simulate attributes already filtered by override (Layer 1)
      mockNormalizedAttributes = [
        {
          key: 'Country',
          title: 'Country',
          dataType: 'select',
          inputType: 'dropdown',
          allowedOverrides: ['CountryGroup'], // Already filtered by override
          dataSourceRef: null,
          isComparable: true,
        },
        {
          key: 'Region',
          title: 'Region',
          dataType: 'select',
          inputType: 'dropdown',
          allowedOverrides: ['CountryGroup'],
          dataSourceRef: null,
          isComparable: true,
        },
        {
          key: 'Amount',
          title: 'Amount',
          dataType: 'int',
          inputType: 'number',
          allowedOverrides: ['CountryGroup'],
          dataSourceRef: null,
          isComparable: true,
        },
      ];
    });

    it('should apply duplicate filtering after override filtering without conflict', () => {
      // Simulate: User has selected Country in expression 0
      const selectedInOthers = new Set(['Country']);

      const result = adapter.getAvailableAttributesForExpression(
        mockNormalizedAttributes,
        false, // allowDuplicateAttributes = false (C3 workflow)
        selectedInOthers
      );

      // Should still have Region and Amount, but not Country
      expect(result.length).toBe(2);
      expect(result.map((a) => a.key)).toEqual(['Region', 'Amount']);
      // Verify allowedOverrides are preserved (not modified by filtering)
      expect(result.every((a) => a.allowedOverrides.includes('CountryGroup'))).toBeTrue();
    });

    it('should preserve attribute metadata when filtering for duplicates', () => {
      const selectedInOthers = new Set(['Country']);

      const result = adapter.getAvailableAttributesForExpression(
        mockNormalizedAttributes,
        false,
        selectedInOthers
      );

      const remainingAttr = result.find((a) => a.key === 'Region');
      expect(remainingAttr).toBeDefined();
      expect(remainingAttr?.dataType).toBe('select');
      expect(remainingAttr?.inputType).toBe('dropdown');
      expect(remainingAttr?.isComparable).toBeTrue();
      expect(remainingAttr?.allowedOverrides).toEqual(['CountryGroup']);
    });

    it('should handle scenario where multiple rows have selections and we are editing row 1', () => {
      const expressions = [
        { attribute: { key: 'Country' } },   // Row 0
        { attribute: { key: 'Region' } },    // Row 1 (current)
        { attribute: { key: 'Amount' } },    // Row 2
      ];

      // When editing row 1, collect keys from rows 0 and 2
      const selectedInOthers = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      // Should only exclude Country and Amount, leaving Region
      const result = adapter.getAvailableAttributesForExpression(
        mockNormalizedAttributes,
        false,
        selectedInOthers
      );

      expect(result.map((a) => a.key)).toEqual(['Region']);
    });

    it('should allow all attributes when allowDuplicateAttributes is true regardless of selections', () => {
      const expressions = [
        { attribute: { key: 'Country' } },
        { attribute: { key: 'Region' } },
        { attribute: { key: 'Amount' } },
      ];

      const selectedInOthers = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);

      // Even though Region and Amount are selected elsewhere, should return all attributes
      const result = adapter.getAvailableAttributesForExpression(
        mockNormalizedAttributes,
        true, // allowDuplicateAttributes = true (permissive mode)
        selectedInOthers
      );

      expect(result).toEqual(mockNormalizedAttributes);
    });

    it('should work correctly in create mode with empty existing expressions', () => {
      const expressions: Array<any> = []; // No prior expressions yet

      const selectedInOthers = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 0);
      expect(selectedInOthers.size).toBe(0);

      const result = adapter.getAvailableAttributesForExpression(
        mockNormalizedAttributes,
        false,
        selectedInOthers
      );

      // All attributes should be available in create mode (no other selections)
      expect(result).toEqual(mockNormalizedAttributes);
    });

    it('should handle mixed null/undefined expressions when collecting selected keys', () => {
      const expressions: Array<any> = [
        null,
        { attribute: { key: 'Country' } },
        undefined,
        { attribute: { key: 'Region' } },
        null,
      ];

      const selectedInOthers = adapter.getSelectedAttributeKeysInOtherExpressions(expressions, 1);

      // Should only collect Region (index 3)
      expect(selectedInOthers).toEqual(new Set(['Region']));
    });
  });
});

describe('WorkflowBehaviorRegistry', () => {
  let registry: WorkflowBehaviorRegistry;

  beforeEach(() => {
    registry = new WorkflowBehaviorRegistry();
  });

  describe('cascade resolver behavior', () => {
    const mockGeoData = [
      {
        regionId: 1,
        regionName: 'EMEA',
        countries: [
          { id: 1, countryKey: 'FR', name: 'France', erpCountryKey: 'FR', erpId: '1' },
          { id: 2, countryKey: 'DE', name: 'Germany', erpCountryKey: 'DE', erpId: '2' },
        ],
      },
      {
        regionId: 2,
        regionName: 'APAC',
        countries: [
          { id: 3, countryKey: 'JP', name: 'Japan', erpCountryKey: 'JP', erpId: '3' },
        ],
      },
      {
        regionId: 99,
        regionName: 'Unmapped',
        countries: [
          { id: 999, countryKey: 'UN', name: 'Unmapped Country', erpCountryKey: 'UN', erpId: '999' },
        ],
      },
    ];

    const cascadeRule = {
      parentAttributeKey: 'Region',
      childAttributeKey: 'Country',
      includeOperators: ['==', '', null],
      excludeOperators: ['!='],
      filterOverrideKey: ['CountryGroup'],
      resetChildOnParentChange: true,
    };

    it('should resolve included countries when operator is not excluded', () => {
      const resolver = registry.getCascadeResolverForWorkflow(C3_RULE_ENGINE_WORKFLOW_ID);

      const resolved = resolver?.resolveChildOptions(
        cascadeRule,
        'EMEA',
        '==',
        { selectedOverride: 'CountryGroup', selectedLevelValues: [], sourceData: mockGeoData }
      ) ?? [];

      expect(resolved).toEqual([
        { label: 'France', value: 'France' },
        { label: 'Germany', value: 'Germany' },
      ]);
    });

    it('should resolve countries outside the region when operator is excluded', () => {
      const resolver = registry.getCascadeResolverForWorkflow(C3_RULE_ENGINE_WORKFLOW_ID);

      const resolved = resolver?.resolveChildOptions(
        cascadeRule,
        'EMEA',
        '!=',
        { selectedOverride: 'CountryGroup', selectedLevelValues: [], sourceData: mockGeoData }
      ) ?? [];

      expect(resolved).toEqual([
        { label: 'Japan', value: 'Japan' },
      ]);
    });

    it('should resolve default child options filtered by selected level values when override matches', () => {
      const resolver = registry.getCascadeResolverForWorkflow(C3_RULE_ENGINE_WORKFLOW_ID);

      const resolved = resolver?.resolveDefaultChildOptions(cascadeRule, {
        selectedOverride: 'CountryGroup',
        selectedLevelValues: ['APAC'],
        sourceData: mockGeoData,
      }) ?? [];

      expect(resolved).toEqual([
        { label: 'Japan', value: 'Japan' },
      ]);
    });

    it('should preserve CBC resolver registration behavior', () => {
      const resolver = registry.getCascadeResolverForWorkflow(CBC_RULE_ENGINE_WORKFLOW_ID);

      expect(resolver).toBeNull();
    });
  });

  it('should validate Reseller expressions with Country key', () => {
    const behavior = registry.getBehaviorForWorkflow(1);

    const result = behavior.validateExpressions([
      { attribute: { key: 'Country' } },
    ], 'Reseller');

    expect(result.valid).toBeTrue();
  });

  it('should validate Reseller expressions with lowercase region key', () => {
    const behavior = registry.getBehaviorForWorkflow(1);

    const result = behavior.validateExpressions([
      { attribute: { key: 'region' } },
    ], 'Reseller');

    expect(result.valid).toBeTrue();
  });

  it('should fail Reseller expressions without Country or Region condition', () => {
    const behavior = registry.getBehaviorForWorkflow(1);

    const result = behavior.validateExpressions([
      { attribute: { key: 'Amount' } },
    ], 'Reseller');

    expect(result.valid).toBeFalse();
    expect(result.error).toBe('Reseller rules must include at least one Country or Region condition.');
  });

  it('should allow non-Reseller overrides without extra constraints', () => {
    const behavior = registry.getBehaviorForWorkflow(1);

    const result = behavior.validateExpressions([], 'Global');

    expect(result.valid).toBeTrue();
  });

  it('should expose shell override mappings for workflow 1', () => {
    const shellConfig = registry.getShellConfigForWorkflow(1);

    expect(shellConfig.enableCompareRuleType).toBeTrue();
    expect(shellConfig.overridesRequiringLevelValue).toEqual(['CountryGroup', 'Country', 'Reseller']);
    expect(shellConfig.geoSelectorOverrideKeys).toEqual(['CountryGroup', 'Country']);
    expect(shellConfig.regionSelectorOverrideKeys).toEqual(['CountryGroup']);
    expect(shellConfig.resellerOverrideKeys).toEqual(['Reseller']);
  });

  it('should exclude Region for CountryGroup override', () => {
    const behavior = registry.getBehaviorForWorkflow(1);

    expect(behavior.getAttributeListForOverride('CountryGroup')).toEqual(['Region']);
    expect(behavior.getAttributeListForOverride('Region')).toEqual([]);
  });

  // ============================================================================
  // allowDuplicateAttributes Configuration Tests
  // ============================================================================

  it('should have allowDuplicateAttributes set to false for C3 workflow (id 1)', () => {
    const shellConfig = registry.getShellConfigForWorkflow(1);

    expect(shellConfig.allowDuplicateAttributes).toBeFalse();
  });

  it('should have allowDuplicateAttributes set to true for default/unknown workflows', () => {
    const shellConfig = registry.getShellConfigForWorkflow(999);

    expect(shellConfig.allowDuplicateAttributes).toBeTrue();
  });

  it('should create consistent default shell configs for all unknown workflows', () => {
    const config1 = registry.getShellConfigForWorkflow(999);
    const config2 = registry.getShellConfigForWorkflow(1000);

    expect(config1.allowDuplicateAttributes).toEqual(config2.allowDuplicateAttributes);
  });
});
