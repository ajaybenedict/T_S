/**
 * Rule Editor Config Adapter Service
 *
 * Transforms raw API response into normalized schema and applies workflow-specific behavior.
 * This service is the adapter layer between backend config and the rule-edit component.
 *
 * Features:
 * - Schema normalization: Converts API field metadata into component-friendly format
 * - Operator derivation: Maps data types to appropriate comparison operators
 * - Dropdown resolution: Handles inline JSON and datasource references
 * - Duplicate attribute filtering: Optionally prevents the same attribute from being selected
 *   in multiple expressions based on workflow-specific configuration
 * - Workflow behavior strategies: Encapsulates complex rule validation and filtering logic
 * - Cascade resolution: Manages parent-child attribute dependencies (e.g., Region -> Country)
 *
 * Attribute Duplication Control:
 * The RuleEditorShellConfig.allowDuplicateAttributes flag controls whether the same attribute
 * can be used in multiple expression rows:
 * - When false (e.g., C3 workflow): An attribute selected in one expression is filtered out
 *   from the attribute dropdown in other expressions during create/edit mode
 * - When true (default): Attributes are unrestricted and can be selected multiple times
 *
 * Usage in Components:
 * Consumers should call getAvailableAttributesForExpression() and
 * getSelectedAttributeKeysInOtherExpressions() to filter attributes dynamically based on
 * the current allowDuplicateAttributes setting and already-selected expressions.
 */

import { Injectable } from '@angular/core';
import {
  UIRuleConfigApiResponse,
  RuleEditorField,
  RuleEditorSchema,
  NormalizedAttribute,
  OperatorSet,
  WorkflowBehaviorStrategy,
  RuleEditComponentConfig,
  CascadeOptionsResolver,
  CascadeResolverContext,
  CascadeRule,
  RuleEditorShellConfig,
  RuleEditorDialogConfigKey
} from 'src/app/models/rule-engine/rule-editor-config.model';
import { C3_RULE_ENGINE_WORKFLOW_ID, c3RuleEngineDialogConfig, CBC_RULE_ENGINE_WORKFLOW_ID } from 'src/app/core/config/rule-engine.config';
import { ApplicationIdEnum } from 'src/app/core/config/permissions.config';
import { c3RuleEngineAlertRecipientAllowedDomains } from 'src/app/core/constants/constants';
import { PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { CountryRegionResponse } from 'src/app/models/ppc/country-region-api.interface';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { RuleEngineHelper } from 'src/app/rule-engine/rule-engine-helper';

@Injectable({
  providedIn: 'root',
})
export class RuleEditorConfigAdapter {
  constructor(private readonly workflowBehaviorRegistry: WorkflowBehaviorRegistry) {}

  /**
   * Adapts API response into normalized schema + workflow behavior.
   * Main entry point: call this with the API response and workflowId.
   */
  adaptConfig(
    apiResponse: UIRuleConfigApiResponse,
    workflowId: number
  ): RuleEditComponentConfig {
    const schema = this.normalizeSchema(apiResponse, workflowId);
    const behavior = this.workflowBehaviorRegistry.getBehaviorForWorkflow(workflowId);
    const cascadeRules = this.workflowBehaviorRegistry.getCascadeRulesForWorkflow(workflowId);
    const cascadeResolver = this.workflowBehaviorRegistry.getCascadeResolverForWorkflow(workflowId);
    const shellConfig = this.workflowBehaviorRegistry.getShellConfigForWorkflow(workflowId);

    return { schema, behavior, cascadeRules, cascadeResolver, shellConfig };
  }

  /**
   * Returns shell-level workflow configuration used by parent editor components.
   */
  getShellConfigForWorkflow(workflowId: number): RuleEditorShellConfig {
    return this.workflowBehaviorRegistry.getShellConfigForWorkflow(workflowId);
  }

  /**
   * Normalizes the raw API response into the internal schema model.
   */
  private normalizeSchema(
    apiResponse: UIRuleConfigApiResponse,
    workflowId: number
  ): RuleEditorSchema {
    const expressionFields = apiResponse.attributeList.filter(
      (f) => f.usedIn === 'expressionBuilder'
    );
    const actionField = apiResponse.attributeList.find(
      (f) => f.usedIn === 'actionBuilder'
    );

    return {
      workflowId,
      expressionAttributes: expressionFields.map((f) =>
        this.normalizeAttribute(f)
      ),
      actionAttribute: actionField ? this.normalizeAttribute(actionField) : null,
      operatorSets: this.deriveOperatorSets(),
      dataSources: apiResponse.dataSource,
    };
  }

  /**
   * Converts a single API field into normalized attribute for internal use.
   */
  private normalizeAttribute(field: RuleEditorField): NormalizedAttribute {
    const validations = field.validations
      ? {
          decimal: field.validations.decimal
            ? {
                min: field.validations.decimal.min ?? undefined,
                max: field.validations.decimal.max ?? undefined,
              }
            : undefined,
          int: field.validations.int
            ? {
                min: field.validations.int.min ?? undefined,
                max: field.validations.int.max ?? undefined,
              }
            : undefined,
          string: field.validations.string
            ? {
                minLength: field.validations.string.minLength ?? undefined,
                maxLength: field.validations.string.maxLength ?? undefined,
              }
            : undefined,
        }
      : undefined;

    return {
      key: field.key,
      title: field.title,
      dataType: field.dataType,
      inputType: this.deriveInputType(field.dataType),
      allowedOverrides: field.allowedOverrides,
      dataSourceRef: field.dataSource,
      isComparable: field.isComparable ?? false,
      validations,
    };
  }

  /**
   * Maps dataType to HTML input type.
   * This replaces the hardcoded logic in rule-edit.component.ts.
   */
  private deriveInputType(
    dataType: string
  ): 'text' | 'number' | 'decimal' | 'dropdown' {
    switch (dataType) {
      case 'int':
        return 'number';
      case 'decimal':
        return 'decimal';
      case 'select':
      case 'bool':
        return 'dropdown';
      case 'string':
      default:
        return 'text';
    }
  }

  /**
   * Derives available operators based on data type.
   * Only numbers get extended operators; all others use == and !=.
   */
  private deriveOperatorSets(): OperatorSet[] {
    return [
      { type: 'number', operators: ['!=', '<', '<=', '>', '>=', '=='] },
    ];
  }

  /**
   * Gets operators for a specific attribute.
   * Numbers get extended operators; everything else uses == and !=.
   */
  getOperatorsForAttribute(
    attribute: NormalizedAttribute,
    operatorSets: OperatorSet[]
  ): string[] {
    const inputType = attribute.inputType;
    if (inputType === 'decimal' || inputType === 'number') {
      const numSet = operatorSets.find((os) => os.type === 'number');
      return numSet?.operators ?? ['==', '!='];
    }
    return ['==', '!='];
  }

  /**
   * Resolves dropdown options from datasource reference.
   * Used when rendering value input for select-type attributes.
   */
  resolveDropdownOptions(
    dataSourceRef: string | null,
    dataSources: Record<string, any>
  ): any[] {
    if (!dataSourceRef) {
      return [];
    }

    const dataSourceDef = dataSources[dataSourceRef] ?? this.tryParseJsonDataSource(dataSourceRef);

    if (!dataSourceDef) {
      return [];
    }

    // If the datasource is an array (like regionCountryDropDown)
    if (Array.isArray(dataSourceDef)) {
      return dataSourceDef;
    }

    // If it contains structured data (like actionDropDown in the "then" field)
    if (dataSourceDef.actionDropDown) {
      return dataSourceDef.actionDropDown;
    }

    return [];
  }

  /**
   * Filters available attributes for a specific expression based on duplicate attribute settings.
   *
   * When allowDuplicateAttributes is false, this method removes any attributes that are
   * already used in other expressions, preventing the same attribute from appearing in multiple rows.
   *
   * @param attributes - The list of all available attributes from the schema
   * @param allowDuplicateAttributes - Configuration flag controlling duplicate attribute behavior
   * @param selectedAttributeKeysInOtherExpressions - Set of attribute keys already selected in other expressions
   * @returns Filtered list of attributes available for the current expression
   *
   * @example
   * // If allowDuplicateAttributes is false and Country is selected in expression 1:
   * const available = getAvailableAttributesForExpression(
   *   allAttributes,
   *   false,
   *   new Set(['Country'])
   * );
   * // Result: allAttributes without Country
   *
   * @example
   * // If allowDuplicateAttributes is true:
   * const available = getAvailableAttributesForExpression(
   *   allAttributes,
   *   true,
   *   new Set(['Country'])
   * );
   * // Result: allAttributes unchanged (Country still available)
   */
  getAvailableAttributesForExpression(
    attributes: NormalizedAttribute[],
    allowDuplicateAttributes: boolean,
    selectedAttributeKeysInOtherExpressions: Set<string>
  ): NormalizedAttribute[] {
    // If duplicates are allowed, return all attributes
    if (allowDuplicateAttributes) {
      return attributes;
    }

    // Filter out attributes that are already selected in other expressions
    return attributes.filter(
      (attribute) => !selectedAttributeKeysInOtherExpressions.has(attribute.key)
    );
  }

  /**
   * Collects all attribute keys currently selected across multiple expressions.
   *
   * This utility method helps identify which attributes are already in use when
   * filtering available attributes for a new/edited expression.
   *
   * @param expressions - Array of expression objects containing selected attributes
   * @param currentExpressionIndex - Index of the current expression to exclude from collection
   * @returns Set of attribute keys used in other expressions
   *
   * @example
   * const selected = getSelectedAttributeKeysInOtherExpressions(
   *   [
   *     { attribute: { key: 'Country' } },
   *     { attribute: { key: 'Region' } }
   *   ],
   *   0
   * );
   * // Result: Set { 'Region' } (Country is at index 0, so excluded)
   */
  getSelectedAttributeKeysInOtherExpressions(
    expressions: Array<{ attribute?: { key?: string } } | null | undefined>,
    currentExpressionIndex: number
  ): Set<string> {
    const selectedKeys = new Set<string>();

    expressions.forEach((expression, index) => {
      // Skip null/undefined expressions and the current expression
      if (!expression || index === currentExpressionIndex) {
        return;
      }

      const attributeKey = expression.attribute?.key?.trim();
      // Only add non-empty keys to the set
      if (attributeKey) {
        selectedKeys.add(attributeKey);
      }
    });

    return selectedKeys;
  }

  private tryParseJsonDataSource(rawDataSource: string): Record<string, any> | null {
    const trimmedDataSource = rawDataSource?.trim();
    if (!trimmedDataSource || (!trimmedDataSource.startsWith('{') && !trimmedDataSource.startsWith('['))) {
      return null;
    }

    try {
      return JSON.parse(trimmedDataSource);
    } catch {
      return null;
    }
  }
}

/**
 * Registry and factory for workflow-specific behavior strategies.
 * This is where workflow-specific rules are defined.
 * 
 * For now, behaviors are hardcoded here by workflowId.
 * In the future, these could also come from the backend.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkflowBehaviorRegistry {
  private readonly strategies: Map<number, WorkflowBehaviorStrategy> = new Map();
  private readonly cascadeRulesMap: Map<number, CascadeRule[]> = new Map();
  private readonly cascadeResolverMap: Map<number, CascadeOptionsResolver> = new Map();
  private readonly shellConfigMap: Map<number, RuleEditorShellConfig> = new Map();

  constructor() {
    this.registerWorkflows();
  }

  /**
   * Registers behavior strategies for each workflow.
   * Add new workflows here as they are introduced.
   */
  private registerWorkflows(): void {
    // Workflow 1: C3 (current application with complex behavior)
    this.strategies.set(C3_RULE_ENGINE_WORKFLOW_ID, new C3WorkflowBehavior());
    this.cascadeRulesMap.set(C3_RULE_ENGINE_WORKFLOW_ID, [
      {
        parentAttributeKey: 'Region',
        childAttributeKey: 'Country',
        includeOperators: ['==', '', null],
        excludeOperators: ['!='],
        filterOverrideKey: ['CountryGroup'],
        resetChildOnParentChange: true,
      },
    ]);
    this.cascadeResolverMap.set(C3_RULE_ENGINE_WORKFLOW_ID, new C3GeoOptionsResolver());
    this.shellConfigMap.set(C3_RULE_ENGINE_WORKFLOW_ID, {
      enableCompareRuleType: true,
      overridesRequiringLevelValue: ['CountryGroup', 'Country', 'Reseller'],
      geoSelectorOverrideKeys: ['CountryGroup', 'Country'],
      regionSelectorOverrideKeys: ['CountryGroup'],
      resellerOverrideKeys: ['Reseller'],
      geoDataSourceKey: 'regionCountryDropDown',
      resellerMaxLength: 50,
      emailRecipientsEnabled: true,
      allowedEmailDomains: [...c3RuleEngineAlertRecipientAllowedDomains],
      applicationId: ApplicationIdEnum.C3,
      dialogActions: {
        publish: 'Publish',
        saveDraft: 'SaveDraft',
        editDraft: 'EditDraft',
        editPublish: 'EditPublish',
      },
      dialogConfig: c3RuleEngineDialogConfig,
      allowDuplicateAttributes: false,
      costAdjustmentMode: false,
    });

    // Workflow 2: CBC
    this.strategies.set(CBC_RULE_ENGINE_WORKFLOW_ID, new CBCWorkflowBehavior());
    this.shellConfigMap.set(CBC_RULE_ENGINE_WORKFLOW_ID, {
      enableCompareRuleType: false,
      overridesRequiringLevelValue: [],
      geoSelectorOverrideKeys: [],
      regionSelectorOverrideKeys: [],
      resellerOverrideKeys: [],
      geoDataSourceKey: 'regionCountryDropDown',
      resellerMaxLength: 50,
      emailRecipientsEnabled: true,
      allowedEmailDomains: [...c3RuleEngineAlertRecipientAllowedDomains],
      applicationId: ApplicationIdEnum.CBC,
      dialogActions: {
        publish: 'Publish',
        saveDraft: 'SaveDraft',
        editDraft: 'EditDraft',
        editPublish: 'EditPublish',
      },
      dialogConfig: c3RuleEngineDialogConfig,
      allowDuplicateAttributes: false,
      costAdjustmentMode: true,
    });
  }

  getBehaviorForWorkflow(workflowId: number): WorkflowBehaviorStrategy {
    return (
      this.strategies.get(workflowId) ?? new DefaultWorkflowBehavior()
    );
  }

  getCascadeRulesForWorkflow(workflowId: number): CascadeRule[] {
    return this.cascadeRulesMap.get(workflowId) ?? [];
  }

  getCascadeResolverForWorkflow(workflowId: number): CascadeOptionsResolver | null {
    return this.cascadeResolverMap.get(workflowId) ?? null;
  }

  getShellConfigForWorkflow(workflowId: number): RuleEditorShellConfig {
    return this.shellConfigMap.get(workflowId) ?? this.createDefaultShellConfig();
  }

  private createDefaultShellConfig(): RuleEditorShellConfig {
    return {
      enableCompareRuleType: false,
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
      dialogConfig: this.createDefaultDialogConfig(),
      allowDuplicateAttributes: true,
      costAdjustmentMode: false,
    };
  }

  private createDefaultDialogConfig(): Record<RuleEditorDialogConfigKey, Omit<PPCDialogData, 'type'>> {
    return {
      createDraft: c3RuleEngineDialogConfig.createDraft,
      createPublish: c3RuleEngineDialogConfig.createPublish,
      edit: c3RuleEngineDialogConfig.edit,
      moveToDraft: c3RuleEngineDialogConfig.moveToDraft,
      moveToPublish: c3RuleEngineDialogConfig.moveToPublish,
    };
  }
}

/**
 * C3 dropdown cascade resolver.
 *
 * Keeps geo-specific option derivation out of the generic rule-edit component.
 */
class C3GeoOptionsResolver implements CascadeOptionsResolver {
  resolveChildOptions(
    rule: CascadeRule,
    parentValue: string,
    operator: string | null,
    context: CascadeResolverContext
  ): SelectDropdown[] {
    const geoData = this.getCountryRegionData(context.sourceData);
    if (geoData.length === 0) {
      return [];
    }

    if (rule.excludeOperators.includes(operator ?? '')) {
      return RuleEngineHelper.getCountriesNotInRegion(geoData, [parentValue]);
    }

    return RuleEngineHelper.getCountryByRegion(geoData, [parentValue]);
  }

  resolveDefaultChildOptions(
    rule: CascadeRule,
    context: CascadeResolverContext
  ): SelectDropdown[] {
    const geoData = this.getCountryRegionData(context.sourceData);
    if (geoData.length === 0) {
      return [];
    }

    const shouldFilterByOverride =
      rule.filterOverrideKey !== null &&
      rule.filterOverrideKey.includes(context.selectedOverride) &&
      context.selectedLevelValues.length > 0;

    if (shouldFilterByOverride) {
      return RuleEngineHelper.getCountryByRegion(geoData, context.selectedLevelValues);
    }

    return RuleEngineHelper.getAllCountryRegionList(geoData).countries;
  }
  private getCountryRegionData(sourceData: unknown): CountryRegionResponse[] {
    return Array.isArray(sourceData) ? sourceData as CountryRegionResponse[] : [];
  }
}

/**
 * CBC Geo dropdown cascade resolver.
 *
 * CBC currently uses the exact same geo cascade behavior as C3.
 * Inheriting from C3GeoOptionsResolver keeps behavior identical while
 * avoiding duplicated method implementations.
 */
class CBCGeoOptionsResolver extends C3GeoOptionsResolver {}

/**
 * CBC Workflow Behavior: mirrors C3 behavior as a starting point.
 */
class CBCWorkflowBehavior implements WorkflowBehaviorStrategy {
  workflowId = CBC_RULE_ENGINE_WORKFLOW_ID;
  shouldResetCountryWhenRegionChanges = false;

  getAttributeListForOverride(
    override: string,
    currentAttributes?: string[]
  ): string[] {
    return [];
  }

  validateExpressions(expressions: any[], override: string) {
    return { valid: true };
  }
}

/**
 * Default behavior: minimal rules, suitable for simple workflows.
 */
class DefaultWorkflowBehavior implements WorkflowBehaviorStrategy {
  workflowId = 0;
  shouldResetCountryWhenRegionChanges = false;

  getAttributeListForOverride(override: string): string[] {
    return []; // Return all attributes
  }

  validateExpressions(expressions: any[], override: string) {
    return { valid: true };
  }
}

/**
 * C3 Workflow Behavior: Complex rule engine with dependencies.
 * This encapsulates all the Region/Country/Reseller logic currently in rule-edit.component.ts.
 */
class C3WorkflowBehavior implements WorkflowBehaviorStrategy {
  workflowId = 1;
  shouldResetCountryWhenRegionChanges = true;

  /**
   * Gets filtered attribute list based on override and current state.
   * Removes Country/Region when override is Country.
    * Removes Region when override is CountryGroup.
   */
  getAttributeListForOverride(
    override: string,
    currentAttributes?: string[]
  ): string[] {
    // This would return the key list to filter. Actual filtering happens in component.
    // For now, just indicate which attributes should be excluded.
    switch (override) {
      case 'Country':
        return ['Country', 'Region']; // can't use these when override is Country
      case 'CountryGroup':
        return ['Region']; // can't use Region when override is CountryGroup
      case 'Reseller':
        // Special: if Country is already used, exclude Region        
        return currentAttributes?.includes('Country') ? ['Region'] : [];
      default:
        return [];
    }
  }

  /**
   * Validates expressions based on override rules.
   * E.g., for Reseller override, at least one Country or Region must be present.
   */
  validateExpressions(expressions: any[], override: string) {
    if (override !== 'Reseller') {
      return { valid: true };
    }

    const hasCountryOrRegion = expressions.some((expr) => {
      const attributeKey = String(expr?.attribute?.key ?? '').trim().toLowerCase();
      return attributeKey === 'country' || attributeKey === 'region';
    });

    if (!hasCountryOrRegion) {
      return {
        valid: false,
        error: 'Reseller rules must include at least one Country or Region condition.',
      };
    }

    return { valid: true };
  }

}
