import { Component, Input, OnInit } from '@angular/core';
import { RuleExpressionUI, RuleTypeEnum } from 'src/app/models/rule-engine/rule-engine';
import { CompareExpressionParts, RuleEngineExpressionHelper, RuleEngineHelper } from '../rule-engine-helper';
import { RuleEditorField } from 'src/app/models/rule-engine/rule-editor-config.model';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RuleEditorConfigAdapter } from 'src/app/core/services/rule-engine/rule-editor-config-adapter.service';

@Component({
  selector: 'app-view-rule',
  templateUrl: './view-rule.component.html',
  styleUrls: ['./view-rule.component.css']
})
export class ViewRuleComponent implements OnInit {
  @Input() inputData: string = '';
  @Input() action!: string;
  @Input() overrideLevelName: string | null = null;
  
  attributeList: RuleEditorField[] = [];
  
  expressions: RuleExpressionUI[] = [];
  firstRow!: RuleExpressionUI;
  otherRows!: RuleExpressionUI[];
  ruleType: RuleTypeEnum = RuleTypeEnum.Conditional;
  compareParts: CompareExpressionParts | null = null;
  actionImg: string | null = null;
  selectedOverride: string = '';
  /** Controls compare-mode visibility in read-only view screens. */
  isCompareFeatureEnabled = false;

  /**
   * True when the current workflow uses cost-adjustment mode.
   * Populated from `RuleEditorShellConfig.costAdjustmentMode` during `ngOnInit`.
   * When true the template renders `displayActionText` instead of the standard
   * action icon + label.
   */
  isCostAdjustmentMode = false;

  readonly ruleTypeEnum = RuleTypeEnum;

  constructor(
    private readonly ruleEngineDataSvc: RuleEngineDataService,
    private readonly ruleConfigAdapter: RuleEditorConfigAdapter,
  ) {}

  /**
   * Initializes display state for rule expression and action icon.
   *
   * Existing conditional rendering behavior is preserved. Compare-mode state
   * is computed in parallel and rendered only when helper classification matches.
   */
  ngOnInit(): void {
    const workflowId = this.ruleEngineDataSvc.getWorkflowId();
    const resolvedWorkflowId = Number.isInteger(workflowId) && (workflowId ?? 0) > 0
      ? (workflowId as number)
      : 0;
    this.isCompareFeatureEnabled = this.ruleConfigAdapter
      .getShellConfigForWorkflow(resolvedWorkflowId)
      .enableCompareRuleType;
    this.isCostAdjustmentMode = this.ruleConfigAdapter
      .getShellConfigForWorkflow(resolvedWorkflowId)
      .costAdjustmentMode;

    // Get attribute list from data service
    const config = this.ruleEngineDataSvc.getUIRuleConfig();
    this.attributeList = config?.attributeList ?? [];
    this.selectedOverride = String(this.overrideLevelName ?? this.ruleEngineDataSvc.getOverrideValue() ?? '').trim();

    this.expressions = RuleEngineExpressionHelper.apiToUi(this.inputData);
    this.firstRow = this.expressions[0];
    this.otherRows = this.expressions.length > 1 ? this.expressions.slice(1) : [];
    this.computeRuleTypeAndCompareParts();

    switch(this.action) {
      case 'Approve':
        this.actionImg = '/assets/Approve.svg';
        break;
      case 'Decline':
        this.actionImg = '/assets/Decline.svg';
        break;
      default:
        this.actionImg = null;
    }
  }

  /**
   * Returns a human-readable action label for the dashboard "Then" row.
   *
   * In CBC cost-adjustment mode the API persists the action as a JSON string
   * `'{"costAdjustment":N}'`. This getter extracts `N` and formats it as
   * `"CostAdjustment: N"` for display.
   *
   * For all other workflows the raw action string is returned unchanged so
   * standard icon + label rendering is unaffected.
   */
  get displayActionText(): string {
    return RuleEngineHelper.formatCostAdjustmentForDisplay(this.action);
  }

  /**
   * Determines whether the current expression should be displayed in Compare mode.
   * Falls back to Conditional when expression is empty or malformed.
   */
  private computeRuleTypeAndCompareParts(): void {
    if (!this.inputData?.trim()) {
      this.ruleType = RuleTypeEnum.Conditional;
      this.compareParts = null;
      return;
    }

    const inferredRuleType = RuleEngineExpressionHelper.inferRuleTypeFromExpression(this.inputData);
    if (!this.isCompareFeatureEnabled && inferredRuleType === RuleTypeEnum.Compare) {
      this.ruleType = RuleTypeEnum.Conditional;
      this.compareParts = null;
      return;
    }

    this.ruleType = inferredRuleType;

    // Parse compare parts only for compare rules to keep conditional path untouched.
    this.compareParts = this.ruleType === RuleTypeEnum.Compare
      ? RuleEngineExpressionHelper.getComparePartsFromExpression(this.inputData)
      : null;
  }

  getValueString(row: RuleExpressionUI) {
    return this.getDisplayValue(row.value);
  }

  /**
   * Resolves the display title for an attribute key by searching the attribute list.
   * Performs case-insensitive key matching against the available RuleEditorField array.
   * Falls back to the key itself if no matching attribute is found.
   * Applicable to both conditional and compare rule expressions.
   *
   * @param attributeKey The attribute key from the expression (e.g., "Amount", "unbilledUsage")
   * @returns The attribute's display title from the field definition, or the key as fallback
   */
  getAttributeTitle(attributeKey: string): string {
    if (!attributeKey || !Array.isArray(this.attributeList)) {
      return attributeKey ?? '';
    }

    const normalizedKey = attributeKey.trim().toLowerCase();
    const matchedField = this.attributeList.find(
      (field) => typeof field?.key === 'string' && field.key.trim().toLowerCase() === normalizedKey
    );
    return matchedField?.title ?? attributeKey;
  }

  /**
   * Returns the display title for an attribute from a conditional rule expression row.
   * Uses getAttributeTitle() to resolve the attribute key to its title.
   *
   * @param row The rule expression UI row containing the attribute
   * @returns The attribute's display title or key as fallback
   */
  getAttributeString(row: RuleExpressionUI): string {
    const attributeKey = this.getDisplayValue(row.attribute);
    return this.getAttributeTitle(attributeKey);
  }

  getCompareSummary(): string {
    if (this.ruleType !== RuleTypeEnum.Compare || !this.compareParts || !this.action) {
      return '';
    }

    const attr1Title = this.getAttributeTitle(this.compareParts.attr1);
    const attr2Title = this.getAttributeTitle(this.compareParts.attr2);
    const attr3Title = this.getAttributeTitle(this.compareParts.attr3);
    if (!attr1Title || !attr2Title || !attr3Title) {
      return '';
    }

    const criteriaRow = this.getCriteriaRow();
    const criteriaLabel = criteriaRow ? this.getCriteriaSummaryLabel(criteriaRow) : null;
    const criteriaValue = criteriaRow ? this.getDisplayValue(criteriaRow.value) : null;

    if (this.selectedOverride === 'Reseller' && (!criteriaLabel || !criteriaValue)) {
      return '';
    }

    return RuleEngineHelper.getCompareSummaryMarkup(
      attr1Title,
      this.compareParts.logicalOperator,
      attr2Title,
      this.compareParts.arithmeticOperator,
      attr3Title,
      this.action,
      {
        label: criteriaLabel,
        value: criteriaValue,
      },
    );
  }

  get showCriteriaSection(): boolean {
    return this.selectedOverride === 'Reseller' && this.ruleType === RuleTypeEnum.Compare && !!this.getCriteriaRow();
  }

  get criteriaSummaryLabel(): string {
    const criteriaRow = this.getCriteriaRow();
    return criteriaRow ? this.getCriteriaSummaryLabel(criteriaRow) : '';
  }

  get criteriaSummaryValue(): string {
    const criteriaRow = this.getCriteriaRow();
    return criteriaRow ? this.getDisplayValue(criteriaRow.value) : '';
  }

  private getCriteriaRow(): RuleExpressionUI | null {
    return this.expressions.find((row) => this.isCriteriaRow(row)) ?? null;
  }

  private isCriteriaRow(row: RuleExpressionUI): boolean {
    const attribute = this.getDisplayValue(row.attribute).trim();
    const operator = this.getDisplayValue(row.operator).trim();
    const value = this.getDisplayValue(row.value).trim();

    if (!attribute || !operator || !value) {
      return false;
    }

    const isCompareArithmeticRow = !!RuleEngineExpressionHelper.getComparePartsFromUiExpressions([row]);
    return !isCompareArithmeticRow && (operator === '=' || operator === '==');
  }

  private getCriteriaSummaryLabel(row: RuleExpressionUI): string {
    const rawAttribute = this.getDisplayValue(row.attribute).trim();
    const resolvedTitle = this.getAttributeTitle(rawAttribute);
    const normalizedSource = `${rawAttribute} ${resolvedTitle}`.toLowerCase();

    if (normalizedSource.includes('country')) {
      return 'Country';
    }

    if (normalizedSource.includes('region')) {
      return 'Region';
    }

    return resolvedTitle;
  }

  private getDisplayValue(value: RuleExpressionUI['attribute'] | RuleExpressionUI['operator'] | RuleExpressionUI['value']): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object') {
      if ('label' in value && value.label !== null && value.label !== undefined) {
        return String(value.label);
      }

      if ('value' in value && value.value !== null && value.value !== undefined) {
        return String(value.value);
      }
    }

    return '';
  }
}
