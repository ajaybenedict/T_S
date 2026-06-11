import { DatePipe } from "@angular/common";
import { LogicalOperators, operatorsTypeMapping, ruleTypeTabConfig, CBC_RULE_ENGINE_WORKFLOW_ID } from "../core/config/rule-engine.config";
import { CountryRegionResponse } from "../models/ppc/country-region-api.interface";
import { CompareCriteriaType, LogicalOperatorValue, Rule, RuleDetail, RuleExpressionUI, RuleSelectableValue, RuleTypeEnum } from "../models/rule-engine/rule-engine";
import { SelectDropdown } from "../models/select-dropdown.interface";
import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { S1Menu } from "../models/s1/s1-menu.interface";
import { DashboardHelper } from "../ppc/dashboard/dashboard-helper";
import { RULE_ENGINE_TYPE_SWITCH_CONFIRMATION_DIALOG, UTC_TIMEZONE } from "../core/constants/constants";
import { S1FilterButtons } from "../models/s1/s1-filter-buttons.interface";
import { RuleEditorField, UIRuleConfigApiResponse } from "../models/rule-engine/rule-editor-config.model";

export interface CompareExpressionParts {
  attr1: string;
  logicalOperator: string;
  attr2: string;
  arithmeticOperator: '+' | '-';
  attr3: string;
}

export interface CompareSummaryCriteria {
  label?: string | null;
  value?: string | null;
}

interface ExpressionSplitState {
  current: string;
  depth: number;
  inSingleQuote: boolean;
  inDoubleQuote: boolean;
  escaped: boolean;
}

/**
 * Minimal state for quote and escape tracking during a character scan.
 * Used by helpers that need to know when a character is inside quoted text
 * but do not need to accumulate the scanned characters.
 */
interface QuoteEscapeState {
  inSingleQuote: boolean;
  inDoubleQuote: boolean;
  escaped: boolean;
}

interface UIParentForm {
    name: string;
    purpose: string;
    override: SelectDropdown;
    levelValue: string[];
    alertRecipients?: string[];
    childForm: UIChildForm;
}

interface UIChildForm {
    action: SelectDropdown;
    expressions: RuleExpressionUI[];
  compare?: {
    criteriaType?: CompareCriteriaType | null;
    criteriaValue?: SelectDropdown | null;
  };
}

function toSafeText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

const ESCAPED_BACKSLASH = String.raw`\\`;
const ESCAPED_DOUBLE_QUOTE = String.raw`\"`;
const ESCAPED_SINGLE_QUOTE = String.raw`\'`;
const SINGLE_BACKSLASH = String.fromCodePoint(92);

export class RuleEngineHelper {
    // Prevent instantiation
    private constructor() {}

    // Get country & region list from the CountryRegionResponse - Used in the dropdowns
    static getAllCountryRegionList(data: CountryRegionResponse[]) {
        const filteredData = data.filter(el => el.regionName !== 'Unmapped');
        const regionList: SelectDropdown[] = filteredData.map(el => ({ label: el.regionName, value: el.regionName }));
        const countryList: SelectDropdown[] = filteredData.flatMap(region => region.countries.map(country => ({ label: country.name, value: country.name })));
        return { countries: countryList, regions: regionList };
    }

    static getCountryByRegion(data: CountryRegionResponse[], selectedRegion: string[]) {
      const filteredData = data.filter(el => el.regionName !== 'Unmapped');
      return filteredData.filter(region => selectedRegion.includes(region.regionName))
              .flatMap(region => region.countries.map(country => ({ label: country.name, value: country.name })));
    }

    /**
     * Filters RuleEditorField list to those usable in the expression builder for the given override.
     * A field is included when:
     *   - usedIn === 'expressionBuilder'
     *   - allowedOverrides contains the selected override
     */
    static getExpressionAttributesForOverride(fields: RuleEditorField[], override: string): SelectDropdown[] {
      return fields
        .filter((f) => f.usedIn === 'expressionBuilder' && Array.isArray(f.allowedOverrides) && f.allowedOverrides.includes(override))
        .map((f) => ({ label: f.title, value: f.key }));
    }

    /**
     * Filters RuleEditorField list to comparable expression attributes for the selected override.
     *
     * This powers compare-tab attribute selectors and is intentionally helper-based
     * so view/edit components can reuse the same computation logic.
     */
    static getComparableExpressionAttributesForOverride(fields: RuleEditorField[], override: string): SelectDropdown[] {
      return fields
        .filter(
          (field) => field.usedIn === 'expressionBuilder'
            && (field.isComparable ?? false) === true
            && Array.isArray(field.allowedOverrides)
            && field.allowedOverrides.includes(override),
        )
        .map((field) => ({ label: field.title, value: field.key }));
    }

    static getDistinctAllowedOverrides(config: UIRuleConfigApiResponse): string[] {
      if (!Array.isArray(config.attributeList)) {
        return [];
      }

      const overrides = new Set<string>();
      config.attributeList.forEach((attribute) => {
        if (!Array.isArray(attribute?.allowedOverrides)) {
          return;
        }

        attribute.allowedOverrides.forEach((override) => {
          if (typeof override === 'string') {
            const normalizedOverride = override.trim();
            if (normalizedOverride) {
              overrides.add(normalizedOverride);
            }
          }
        });
      });

      return [...overrides];
    }

    static getCountriesNotInRegion(data: CountryRegionResponse[], selectedRegion: string[]) {
      const filteredData = data.filter(el => el.regionName !== 'Unmapped');

      // Get all countries inside the selected regions
      const countriesInSelectedRegions = new Set(
        filteredData
          .filter(region => selectedRegion.includes(region.regionName))
          .flatMap(region => region.countries.map(country => country.name))
      );

      // Return countries not belonging to the selected regions
      return filteredData
        .flatMap(region => region.countries)
        .filter(country => !countriesInSelectedRegions.has(country.name))
        .map(country => ({ label: country.name, value: country.name }));
    }

    // used to convert the UI form model to API model before publishing the rule
    static getAPIRuleformat(formValue: UIParentForm, isDraft: boolean, workflowId: number, attributeList?: RuleEditorField[]): RuleDetail {
      const compareCriteriaType = formValue.childForm.compare?.criteriaType ?? null;
      const compareCriteriaValue = formValue.childForm.compare?.criteriaValue ?? null;
      const selectedOverride = toSafeText(formValue.override?.value);
      const isResellerCompareCriteriaSelected = selectedOverride === 'Reseller' && !!compareCriteriaType && !!compareCriteriaValue;
      const normalizedCompareCriteriaType = compareCriteriaType?.toLowerCase();

      const baseExpression = RuleEngineExpressionHelper.uiToApi(formValue.childForm.expressions);
      let expression = baseExpression;
      if (isResellerCompareCriteriaSelected) {
        const matchedField = Array.isArray(attributeList) && normalizedCompareCriteriaType
          ? attributeList.find((f) => f.title?.toLowerCase() === normalizedCompareCriteriaType)
          : undefined;
        const criteriaFieldKey = matchedField?.key ?? compareCriteriaType;
        const criteriaVal = toSafeText(compareCriteriaValue?.value).trim();
        const escaped = criteriaVal.replaceAll(SINGLE_BACKSLASH, ESCAPED_BACKSLASH).replaceAll('"', ESCAPED_DOUBLE_QUOTE);
        // Compare-mode reseller criteria is serialized using equality operator "=="
        // to keep it consistent with the rest of expression serialization.
        const criteriaClause = `(input1.${criteriaFieldKey} == "${escaped}")`;
        expression = baseExpression ? `${criteriaClause} && ${baseExpression}` : criteriaClause;
      }

      /**
       * CBC cost-adjustment serialization:
       * The action form control holds a raw decimal string (e.g. "4.5").
       * For CBC workflows this must be sent to the API as a JSON-stringified object
       * `{"costAdjustment": 4.5}` so the backend can parse the structured value.
       * All other workflows pass the action value through unchanged.
       */
      const rawActionValue = toSafeText(formValue.childForm.action?.value ?? formValue.childForm.action).trim();
      const serializedAction = workflowId === CBC_RULE_ENGINE_WORKFLOW_ID
        ? this.serializeCostAdjustmentAction(rawActionValue)
        : rawActionValue;

        const datatoSend: RuleDetail = {
            workflowId,
            name: formValue.name,
            purpose: formValue.purpose,
            overrideLevelName: selectedOverride,
            levelValues: formValue.levelValue ?? ['Global'], // if levelValue is not present then it is Global & have to hardcode it
            emails: Array.isArray(formValue.alertRecipients) ? formValue.alertRecipients : [],
            action: serializedAction,
            expression,
            isDraft,
        };
        return datatoSend;
    }

    /**
     * Serializes a raw decimal string into the CBC action JSON format.
     *
     * Converts a numeric string like `"4.5"` into the stringified object
     * `'{"costAdjustment":4.5}'` expected by the CBC rule API.
     *
     * Falls back to the raw value as-is when the input cannot be parsed as
     * a finite number, preventing silent data loss.
     *
     * @param rawValue - The raw decimal string entered by the user.
     * @returns JSON-stringified cost-adjustment object, or the raw value on parse failure.
     */
    static serializeCostAdjustmentAction(rawValue: string): string {
      const numeric = Number.parseFloat(rawValue);
      if (!Number.isFinite(numeric)) {
        return rawValue;
      }
      return JSON.stringify({ costAdjustment: numeric });
    }

    /**
     * Parses a CBC action string back into the raw decimal value for form hydration.
     *
     * The API persists the action as `'{"costAdjustment":4.5}'`. This helper
     * extracts the numeric value as a string so the cost-adjustment textbox
     * is pre-filled correctly in edit and duplicate modes.
     *
     * Returns `null` when the input is not a valid CBC cost-adjustment JSON string
     * so callers can fall back to their default behaviour.
     *
     * @param actionStr - Raw action string from the API rule payload.
     * @returns Decimal string (e.g. `"4.5"`) when parseable; otherwise `null`.
     */
    static tryParseCostAdjustmentValue(actionStr: string): string | null {
      const trimmed = toSafeText(actionStr).trim();
      if (!trimmed.startsWith('{')) {
        return null;
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (
          parsed !== null &&
          typeof parsed === 'object' &&
          typeof parsed['costAdjustment'] === 'number' &&
          Number.isFinite(parsed['costAdjustment'])
        ) {
          return String(parsed['costAdjustment']);
        }
      } catch {
        // Not valid JSON — return null
      }
      return null;
    }

    /**
     * Formats a CBC action string for display in the rule view dashboard.
     *
     * Parses `'{"costAdjustment":4.5}'` and returns the human-readable label
     * `"CostAdjustment: 4.5"`. Falls back to the raw action string when the
     * input is not a valid cost-adjustment payload.
     *
     * @param actionStr - Raw action string from the API rule payload.
     * @returns Formatted display string for the dashboard "Then" row.
     */
    static formatCostAdjustmentForDisplay(actionStr: string): string {
      const value = this.tryParseCostAdjustmentValue(actionStr);
      // Preserve raw display for non-CBC payloads and malformed JSON inputs.
      if (value === null) {
        return toSafeText(actionStr);
      }

      return `CostAdjustment: ${value}`;
    }

    // used to get the list of operators for the rule expression
    static getOperatorsDropdown(type: 'string' | 'number'): SelectDropdown[] {
        const operatorList = operatorsTypeMapping.filter(el => el.type == type).flatMap(el => el.operators);
        return operatorList.map(op => ({label: op, value: op}));
    }

    // used to get the list of actions/decision
    static getActionListDropdown() {
        const actionList: SelectDropdown[] = [
            {
                label: 'Approve',
                value: 'Approve',
                imgAlt: 'Approve',
                imgUrl: '/assets/Approve.svg',
            },
            {
                label: 'Decline',
                value: 'Decline',
                imgAlt: 'Decline',
                imgUrl: '/assets/Decline.svg',
            }
        ];
        return actionList;
    }

    static getCompareSummaryMarkup(
      attr1Title: string,
      logicalOperator: string,
      attr2Title: string,
      arithmeticOperator: string,
      attr3Title: string,
      actionLabel: string,
      criteria?: CompareSummaryCriteria,
    ): string {
      const safeAttr1 = this.escapeHtml(attr1Title);
      const safeLogicalOperator = toSafeText(logicalOperator);
      const safeAttr2 = this.escapeHtml(attr2Title);
      const safeArithmeticOperator = toSafeText(arithmeticOperator);
      const safeAttr3 = this.escapeHtml(attr3Title);
      const safeAction = this.escapeHtml(actionLabel);
      const criteriaLabel = criteria?.label;
      const criteriaValue = criteria?.value;
      const hasCriteria = !!toSafeText(criteriaLabel).trim() && !!toSafeText(criteriaValue).trim();
      const safeCriteriaLabel = this.escapeHtml(toSafeText(criteriaLabel));
      const safeCriteriaValue = this.escapeHtml(toSafeText(criteriaValue));
      const criteriaSegment = hasCriteria ? ` & ${safeCriteriaLabel} is ${safeCriteriaValue}` : '';

      return `If ${safeAttr1} is ${safeLogicalOperator} (${safeAttr2} ${safeArithmeticOperator} ${safeAttr3})${criteriaSegment}, then <span class="s1-FW700">${safeAction}</span>.`;
    }

    private static escapeHtml(value: string): string {
      return toSafeText(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    /**
     * To filter the attribute type based on the override selected & convert to SelectDropdown type for dropdown's input.
     * @param values
     * @param selectedOverride
     * @returns SelectDropdown[]
     */
    static getAttributeDropdown(values: string[], _selectedOverride: string): SelectDropdown[] {
        // Kept generic: override-driven filtering is handled by config/behavior adapters.
        return values.map(val => ({ label: val, value: val }));
    }

    /**
     * Returns rule-type tabs based on compare feature visibility.
     *
     * When Compare is enabled: returns both Conditional and Compare tabs.
     * When Compare is disabled: returns empty (no tabs shown; Conditional mode is default).
     *
     * @param isCompareFeatureEnabled Must be sourced from WorkflowBehaviorRegistry shell config.
     */
    static getRuleTypesTabList(
      isCompareFeatureEnabled: boolean,
    ): Partial<Record<RuleTypeEnum, S1FilterButtons>> {
      // When compare is disabled, no tabs are shown—just conditional mode directly
      if (!isCompareFeatureEnabled) {
        return {};
      }

      // When compare is enabled, show both tabs with Conditional selected first
      return {
        [RuleTypeEnum.Conditional]: {
          selected: true,
          type: "filter",
          displayName: ruleTypeTabConfig[RuleTypeEnum.Conditional].displayName,
          onClickEvent: ruleTypeTabConfig[RuleTypeEnum.Conditional].onClickEvent,
        },
        [RuleTypeEnum.Compare]: {
          selected: false,
          type: "filter",
          displayName: ruleTypeTabConfig[RuleTypeEnum.Compare].displayName,
          onClickEvent: ruleTypeTabConfig[RuleTypeEnum.Compare].onClickEvent,
        },
      };
    }

    static getRuleTypeTabSwitchConfirmationDialogData() {
    return {
      header: RULE_ENGINE_TYPE_SWITCH_CONFIRMATION_DIALOG.HEADER,
      content: RULE_ENGINE_TYPE_SWITCH_CONFIRMATION_DIALOG.CONTENT,
      primaryBtnName: 'Confirm',
      primaryBtnAction: 'confirm',
      secondaryBtnName: 'Cancel',
      secondaryBtnAction: 'cancel',
      type: 'RuleEngineConfirmation',      
    };
  }
}

/**
 * Helper for converting between API expression string and UI model (RuleExpressionUI).
 */
export class RuleEngineExpressionHelper {
  /**
   * A rule is Compare if ANY clause in the expression contains an arithmetic operator (+/-)
   * in its value part (i.e. attr2 +/- attr3). Otherwise it is Conditional.
   */
  static inferRuleTypeFromExpression(expressionString: string): RuleTypeEnum {
    const clauses = this.splitExpressionByLogicalOperators(expressionString);
    const hasArithmetic = clauses.some((clause) => {
      const parsed = this.parseSingleClause(clause.text);
      if (!parsed) return false;
      return !!this.parseCompareOperandParts(
        this.getRowFieldValue(parsed.attribute),
        this.getRowFieldValue(parsed.operator),
        this.getRowFieldValue(parsed.value),
      );
    });
    return hasArithmetic ? RuleTypeEnum.Compare : RuleTypeEnum.Conditional;
  }

  /**
   * A rule is Compare if ANY row in the UI expression array contains an arithmetic operand.
   */
  static inferRuleTypeFromUiExpressions(expressions: RuleExpressionUI[]): RuleTypeEnum {
    if (!Array.isArray(expressions)) {
      return RuleTypeEnum.Conditional;
    }

    const hasArithmetic = expressions.some((row) => {
      const attribute = this.getRowFieldValue(row?.attribute);
      const operator = this.getRowFieldValue(row?.operator);
      const value = this.getRowFieldValue(row?.value);
      return !!this.parseCompareOperandParts(attribute, operator, value);
    });

    return hasArithmetic ? RuleTypeEnum.Compare : RuleTypeEnum.Conditional;
  }

  /**
   * Returns the compare parts from the first clause that contains an arithmetic operand,
   * regardless of how many clauses exist in the expression.
   */
  static getComparePartsFromExpression(expressionString: string): CompareExpressionParts | null {
    const clauses = this.splitExpressionByLogicalOperators(expressionString);
    for (const clause of clauses) {
      const parsedClause = this.parseSingleClause(clause.text);
      if (!parsedClause) continue;
      const parts = this.parseCompareOperandParts(
        this.getRowFieldValue(parsedClause.attribute),
        this.getRowFieldValue(parsedClause.operator),
        this.getRowFieldValue(parsedClause.value),
      );
      if (parts) return parts;
    }
    return null;
  }

  /**
   * Returns the compare parts from the first UI row that contains an arithmetic operand,
   * regardless of how many rows exist in the expressions array.
   */
  static getComparePartsFromUiExpressions(expressions: RuleExpressionUI[]): CompareExpressionParts | null {
    if (!Array.isArray(expressions)) return null;
    for (const row of expressions) {
      const attribute = this.getRowFieldValue(row?.attribute);
      const operator = this.getRowFieldValue(row?.operator);
      const value = this.getRowFieldValue(row?.value);
      const parts = this.parseCompareOperandParts(attribute, operator, value);
      if (parts) return parts;
    }
    return null;
  }

  /**
   * Extracts compare edit hydration parts from a raw API expression.
   *
   * This method is designed for edit mode where we must split reseller compare expressions
   * into:
   * 1) compare arithmetic clause (always required for compare mode), and
   * 2) optional criteria clause (country/region equality clause when logical connector exists).
   *
   * The method is intentionally source-expression-based (not UI-row-based), so it stays
   * reliable even when criteria attributes are not part of the comparable attribute list.
   */
  static getCompareEditHydrationFromExpression(expressionString: string): {
    hasLogicalConnector: boolean;
    compareParts: CompareExpressionParts | null;
    criteria: { criteriaType: CompareCriteriaType; rawValue: string } | null;
  } {
    const clauses = this.splitExpressionByLogicalOperators(expressionString);
    const hasLogicalConnector = clauses.length > 1;

    let compareParts: CompareExpressionParts | null = null;
    let criteria: { criteriaType: CompareCriteriaType; rawValue: string } | null = null;

    for (const clause of clauses) {
      const parsedClause = this.parseSingleClause(clause.text);
      if (!parsedClause) {
        continue;
      }

      const attribute = this.getRowFieldValue(parsedClause.attribute).trim();
      const operator = this.getRowFieldValue(parsedClause.operator).trim();
      const value = this.getRowFieldValue(parsedClause.value).trim();

      const parsedCompareParts = this.parseCompareOperandParts(attribute, operator, value);
      if (parsedCompareParts) {
        compareParts = parsedCompareParts;
        continue;
      }

      // Backward compatibility:
      // - legacy persisted criteria used '='
      // - new serialization uses '=='
      // Accept both so existing rules remain editable.
      if (operator !== '=' && operator !== '==') {
        continue;
      }

      const normalizedAttr = attribute.toLowerCase();
      let criteriaType: CompareCriteriaType | null = null;
      if (normalizedAttr.includes('country')) {
        criteriaType = 'Country';
      } else if (normalizedAttr.includes('region')) {
        criteriaType = 'Region';
      }

      if (!criteriaType) {
        continue;
      }

      criteria = { criteriaType, rawValue: value };
    }

    return {
      hasLogicalConnector,
      compareParts,
      criteria,
    };
  }

  /**
   * Builds the right-hand compare operand string expected by API expression parser.
   * Example output: input1.AvailableCredit - input1.UnbilledUsage
   */
  static buildCompareOperand(attr2: string, arithmeticOperator: '+' | '-', attr3: string): string {
    const safeAttr2 = toSafeText(attr2).trim();
    const safeAttr3 = toSafeText(attr3).trim();
    return `input1.${safeAttr2} ${arithmeticOperator} input1.${safeAttr3}`;
  }

  /**
 * Convert API expression string to UI model. Use only in view mode.
 * @param apiExpressions Expression string e.g. (input1.Amount < 20) && (input1.Country == "Denmark")
 */
  static apiToUi(apiExpressions: string): RuleExpressionUI[] {
    const parsed = this.parseExpressionString(apiExpressions);
    if (!parsed.length) {
      return [];
    }

    return parsed.map((apiItem, index) => {
      const lgOpFromPrev = index === 0 ? undefined : (parsed[index - 1].logicalOperator ?? undefined);
      return {
        logicalOperator: lgOpFromPrev,
        attribute: apiItem.attribute,
        operator: apiItem.operator,
        value: apiItem.value
      };
    });
  }
  /**
   * Convert API payload into edit-form values.
   *
   * This method prepares two pieces of UI state:
   * 1) expression rows (attribute/operator/value)
   * 2) selected action option
   *
   * @param apiData API model with serialized expression and action name.
   * @param supportedExpressionAttributes Pre-filtered expression attributes eligible for this mode.
   * @returns Form-ready expression rows and resolved action dropdown option.
   */
  static apiToUiForm(
    apiData: { expression: string, action: string },
      supportedExpressionAttributes: RuleEditorField[],
  ) {
    // Step 1: parse API expression and map each clause to form-friendly row values.
    let expressionsToSend: RuleExpressionUI[] = [];
    const apiExpressions = this.parseExpressionString(apiData.expression);
    apiExpressions.forEach((expr) => {
      expressionsToSend.push(this.mapParsedExpressionToUiRow(expr, supportedExpressionAttributes));
    });

    const foundedAction = this.getActionForForm(apiData.action);

    // Step 2: shift logical operators to match UI row placement rules.
    const transformed = this.normalizeUiLogicalOperators(expressionsToSend);
    return { expressions: transformed, action: foundedAction };
  }

  /**
   * Convert one parsed API clause into a single UI expression row.
   *
   * @param expr Parsed expression clause from API string.
   * @param supportedExpressionAttributes Pre-filtered expression attributes eligible for this mode.
   * @returns UI row with normalized attribute/operator/value fields.
   */
  private static mapParsedExpressionToUiRow(
    expr: RuleExpressionUI,
    supportedExpressionAttributes: RuleEditorField[],
  ): RuleExpressionUI {
    const attributeValue = this.getRowFieldValue(expr.attribute);
    const operatorValue = this.getRowFieldValue(expr.operator);
    const expressionValue = this.getRowFieldValue(expr.value);

    const foundedAttr = this.findSupportedAttribute(attributeValue, supportedExpressionAttributes);
    const foundedOperator = { label: operatorValue, value: operatorValue };
    const foundedValue = this.toUiExpressionValue(foundedAttr, expressionValue);

    return {
      attribute: foundedAttr ? { label: foundedAttr.title, value: foundedAttr.key } : null,
      operator: foundedOperator,
      value: foundedValue,
      logicalOperator: expr.logicalOperator ?? undefined
    };
  }

  /**
   * Resolve an attribute against a pre-filtered API-driven expression list.
   *
   * @param attributeValue Attribute name from parsed expression.
   * @param supportedExpressionAttributes Expression attributes already filtered by mode.
   * @returns Matching field when supported; otherwise undefined.
   */
  private static findSupportedAttribute(
    attributeValue: string,
    supportedExpressionAttributes: RuleEditorField[],
  ): RuleEditorField | undefined {
    if (!attributeValue || !Array.isArray(supportedExpressionAttributes)) {
      return undefined;
    }

    const matchedField = supportedExpressionAttributes
      .find((field) => {
        const title = field?.title?.toLowerCase();
        const key = field?.key?.toLowerCase();
        const normalizedValue = attributeValue.toLowerCase();
        return title === normalizedValue || key === normalizedValue;
      });

    return matchedField;
  }

  /**
   * Convert parsed expression value into UI field value type.
   *
   * Dropdown attributes are resolved from metadata (dataType: bool/select)
   * so this remains workflow-agnostic.
   *
   * @param attributeField Matched field metadata for the expression attribute.
   * @param expressionValue Raw parsed expression value.
   * @returns Dropdown object or plain string for UI binding.
   */
  private static toUiExpressionValue(attributeField: RuleEditorField | undefined, expressionValue: string): RuleSelectableValue {
    return this.isDropdownValueAttribute(attributeField)
      ? { label: expressionValue, value: expressionValue }
      : expressionValue;
  }

  /**
   * Determines whether a field should bind value as dropdown option.
   *
   * @param attributeField Matched field metadata.
   * @returns True when attribute uses dropdown value selection in the UI.
   */
  private static isDropdownValueAttribute(attributeField: RuleEditorField | undefined): boolean {
    if (!attributeField) {
      return false;
    }

    return attributeField.dataType === 'bool' || attributeField.dataType === 'select';
  }

  /**
   * Resolve API action string to action dropdown option used by the form.
   *
   * @param actionValue API action value.
   * @returns Matching action option; falls back to a plain option preserving
   *          the API value so edit-mode prefill does not drop unknown actions.
   */
  private static getActionForForm(actionValue: string): SelectDropdown | null {
    const matchedAction = RuleEngineHelper.getActionListDropdown().find(el => el.value == actionValue);
    if (matchedAction) {
      return matchedAction;
    }

    const normalizedValue = toSafeText(actionValue).trim();
    return normalizedValue ? { label: normalizedValue, value: normalizedValue } : null;
  }

  /**
   * Align logical-operator placement with UI row semantics.
   *
   * API parsing stores logical operator on the current clause, while the UI
   * expects each row to carry the operator that connects from the previous row.
   *
   * @param expressions Parsed UI rows before operator alignment.
   * @returns Rows with logical operators shifted to UI-compatible positions.
   */
  private static normalizeUiLogicalOperators(expressions: RuleExpressionUI[]): RuleExpressionUI[] {
    return expressions.map((uiItem, i, arr) => {
      const transformedLogicalOperator = (i == 0) ? null : arr[i - 1]?.logicalOperator ?? null;
      return {
        attribute: uiItem.attribute,
        operator: uiItem.operator,
        value: uiItem.value,
        logicalOperator: this.normalizeLogical(transformedLogicalOperator) ?? undefined
      };
    });
  }

  /**
   * Normalize logical operator input to canonical form.
   *
   * @param op Supported inputs: string ('And', 'Or'), or falsy.
   * @returns Normalized operator string ('And' | 'Or') when valid; otherwise null.
   */
  static normalizeLogical (op: LogicalOperatorValue | null | undefined): LogicalOperatorValue | null {
      if (!op) return null;
      if (op === 'And' || op === 'Or') {
        return op;
      }
      return null;
  };

  /**
   * Convert UI form model to API expression string.
   * @param uiExpressions UI array (RuleExpressionUI[])
   */
  static uiToApi(uiExpressions: RuleExpressionUI[]): string {
    if (!Array.isArray(uiExpressions) || uiExpressions.length === 0) {
      return '';
    }

    return uiExpressions.map((uiItem, i, arr) => {
      const isLast = i === arr.length - 1;
      const attribute = this.getRowFieldValue(uiItem.attribute);
      const operator = this.getRowFieldValue(uiItem.operator);
      const value = this.getRowFieldValue(uiItem.value);

      const condition = this.buildConditionString(attribute, operator, value);
      if (isLast) {
        return condition;
      }

      const nextLogical = this.normalizeLogical(arr[i + 1]?.logicalOperator ?? null) ?? LogicalOperators['And'];
      const connector = this.toLogicalConnector(nextLogical);
      return `${condition} ${connector}`;
    }).join(' ');
  }

  /**
   * Parse an API expression string into ordered UI expression rows.
   *
   * Each parsed row carries the logical operator that connects it to the next
   * row. The final row always has no logical operator.
   *
   * @param expressionString Serialized API expression string.
   * @returns Parsed expression rows for UI mapping.
   */
  private static parseExpressionString(expressionString: string): RuleExpressionUI[] {
    if (!expressionString || typeof expressionString !== 'string') {
      return [];
    }

    // Support both bracketed and non-bracketed clauses by splitting on top-level logical operators.
    const clauses = this.splitExpressionByLogicalOperators(expressionString);       
    if (!clauses.length) {
      return [];
    }

    const parsed: RuleExpressionUI[] = [];
    for (let i = 0; i < clauses.length; i++) {
      const clause = clauses[i];
      const row = this.parseSingleClause(clause.text);      
      if (!row) {
        continue;
      }

      const isLast = i === clauses.length - 1;
      row.logicalOperator = isLast
        ? undefined
        : this.normalizeLogical(clause.logicalOperator ?? LogicalOperators['And']) ?? undefined;
      parsed.push(row);
    }

    if (!parsed.length) {
      return [];
    }

    const lastParsedClause = parsed.at(-1);
    if (lastParsedClause) {
      lastParsedClause.logicalOperator = undefined;
    }
    return parsed;
  }

  /**
   * Split expression into clauses by top-level logical connectors.
   *
   * Supports both symbolic connectors (&&, ||) and word connectors (And, Or),
   * while respecting quoted strings and nested parentheses.
   */
  private static splitExpressionByLogicalOperators(
    expressionString: string
  ): Array<{ text: string; logicalOperator?: LogicalOperatorValue | null }> {
    const clauses: Array<{ text: string; logicalOperator?: LogicalOperatorValue | null }> = [];
    let skipChars = 0;
    const state: ExpressionSplitState = {
      current: '',
      depth: 0,
      inSingleQuote: false,
      inDoubleQuote: false,
      escaped: false,
    };

    for (let i = 0; i < expressionString.length; i++) {
      if (skipChars > 0) {
        skipChars -= 1;
        continue;
      }

      const char = expressionString[i];

      if (this.consumeEscapedCharacter(state, char)) {
        continue;
      }

      if (this.beginEscapeSequence(state, char)) {
        continue;
      }

      if (this.toggleQuoteState(state, char)) {
        continue;
      }

      if (this.consumeParenthesis(state, char)) {
        continue;
      }

      const connectorInfo = this.readTopLevelConnector(expressionString, i, state);
      if (connectorInfo) {
        clauses.push({
          text: state.current.trim(),
          logicalOperator: this.detectLogicalOperator(connectorInfo.connectorToken),
        });
        state.current = '';
        skipChars = connectorInfo.skipChars;
        continue;
      }

      state.current += char;
    }

    const lastClause = state.current.trim();
    if (lastClause) {
      clauses.push({ text: lastClause });
    }

    return clauses.filter(clause => clause.text.length > 0);
  }

  /**
   * Consumes a character that was escaped by a prior backslash.
   */
  private static consumeEscapedCharacter(state: ExpressionSplitState, char: string): boolean {
    if (!state.escaped) {
      return false;
    }

    state.current += char;
    state.escaped = false;
    return true;
  }

  /**
   * Marks the next character as escaped when inside quotes.
   */
  private static beginEscapeSequence(state: ExpressionSplitState, char: string): boolean {
    const isInsideQuote = state.inSingleQuote || state.inDoubleQuote;
    if (!isInsideQuote || char !== '\\') {
      return false;
    }

    state.current += char;
    state.escaped = true;
    return true;
  }

  /**
   * Updates quote-state tracking and consumes quote characters.
   */
  private static toggleQuoteState(state: ExpressionSplitState, char: string): boolean {
    if (!state.inDoubleQuote && char === "'") {
      state.inSingleQuote = !state.inSingleQuote;
      state.current += char;
      return true;
    }

    if (!state.inSingleQuote && char === '"') {
      state.inDoubleQuote = !state.inDoubleQuote;
      state.current += char;
      return true;
    }

    return false;
  }

  /**
   * Updates parenthesis depth only when not inside quoted text.
   */
  private static consumeParenthesis(state: ExpressionSplitState, char: string): boolean {
    if (state.inSingleQuote || state.inDoubleQuote) {
      return false;
    }

    if (char === '(') {
      state.depth += 1;
      state.current += char;
      return true;
    }

    if (char === ')') {
      state.depth = Math.max(0, state.depth - 1);
      state.current += char;
      return true;
    }

    return false;
  }

  /**
   * Reads a top-level logical connector and returns the token and index to jump to.
   */
  private static readTopLevelConnector(
    expressionString: string,
    index: number,
    state: ExpressionSplitState,
    ): { connectorToken: string; skipChars: number } | null {
    if (state.inSingleQuote || state.inDoubleQuote || state.depth !== 0) {
      return null;
    }

    const symbolicConnector = expressionString.slice(index, index + 2);
    if (symbolicConnector === '&&' || symbolicConnector === '||') {
      return { connectorToken: symbolicConnector, skipChars: 1 };
    }

    const wordConnector = this.matchWordLogicalOperator(expressionString, index);
    if (!wordConnector) {
      return null;
    }

    return {
      connectorToken: wordConnector,
      skipChars: wordConnector.length - 1,
    };
  }

  /**
   * Match a top-level logical connector represented as a word.
   */
  private static matchWordLogicalOperator(expressionString: string, index: number): string | null {
    const rest = expressionString.slice(index);
    const match = /^(And|Or)\b/i.exec(rest);
    if (!match) {
      return null;
    }

    const word = match[1];
    const prevChar = index > 0 ? expressionString[index - 1] : ' ';
    const nextChar = expressionString[index + word.length] ?? ' ';
    const hasLeftBoundary = /[\s)]/.test(prevChar);
    const hasRightBoundary = /[\s(]/.test(nextChar);

    if (!hasLeftBoundary || !hasRightBoundary) {
      return null;
    }

    return word;
  }

  /**
   * Parse a single clause into attribute, operator, and value parts.
   *
   * Supported input format example: input1.Amount <= 20
   *
   * @param clauseText Clause content without outer parentheses.
   * @returns Parsed row or null when clause does not match expected pattern.
   */
  private static parseSingleClause(clauseText: string): RuleExpressionUI | null {
    const normalizedClause = this.stripOuterWrappingParentheses(clauseText);
    const parsedParts = this.splitClauseByOperator(normalizedClause);
    if (!parsedParts) {
      return null;
    }

    const normalizedAttributePath = parsedParts.left.trim();
    if (!this.isValidAttributePath(normalizedAttributePath)) {
      return null;
    }

    const attribute = this.getLastAttributePathSegment(normalizedAttributePath);
    const operator = parsedParts.operator;
    const rawValue = parsedParts.right;
    const value = this.unquoteValue(rawValue);

    return {
      attribute,
      operator,
      value,
      logicalOperator: undefined,
    };
  }

  /**
   * Finds the first top-level comparison operator in a clause and splits it.
   */
  private static splitClauseByOperator(clauseText: string): { left: string; operator: string; right: string } | null {
    const quoteState: QuoteEscapeState = { inSingleQuote: false, inDoubleQuote: false, escaped: false };
    let depth = 0;

    for (let i = 0; i < clauseText.length; i++) {
      const char = clauseText[i];
      if (this.isInsideQuotedRegion(quoteState, char)) {
        continue;
      }

      const nextDepth = this.getNextDepth(depth, char);
      if (nextDepth !== depth) {
        depth = nextDepth;
        continue;
      }

      if (depth !== 0) {
        continue;
      }

      const operatorToken = this.readComparisonOperatorToken(clauseText, i);
      if (!operatorToken) {
        continue;
      }

      return this.buildClauseSplitResult(clauseText, i, operatorToken);
    }

    return null;
  }

  /**
   * Returns true when the current character should be skipped due to quote/escape state.
   */
  private static isInsideQuotedRegion(state: QuoteEscapeState, char: string): boolean {
    const consumedByQuoting = this.advanceQuoteEscapeState(state, char);
    return consumedByQuoting || state.inSingleQuote || state.inDoubleQuote;
  }

  /**
   * Calculates the next parenthesis depth for a scanned character.
   */
  private static getNextDepth(currentDepth: number, char: string): number {
    if (char === '(') {
      return currentDepth + 1;
    }

    if (char === ')') {
      return Math.max(0, currentDepth - 1);
    }

    return currentDepth;
  }

  /**
   * Reads a comparison operator token at index, preferring two-char operators.
   */
  private static readComparisonOperatorToken(clauseText: string, index: number): string | null {
    const twoCharToken = clauseText.slice(index, index + 2);
    if (this.isTwoCharComparisonOperator(twoCharToken)) {
      return twoCharToken;
    }

    const oneCharToken = clauseText[index];
    if (this.isOneCharComparisonOperator(oneCharToken)) {
      return oneCharToken;
    }

    return null;
  }

  /**
   * Creates split output for a matched operator token.
   */
  private static buildClauseSplitResult(
    clauseText: string,
    index: number,
    operatorToken: string,
  ): { left: string; operator: string; right: string } | null {
    const left = clauseText.slice(0, index).trim();
    const right = clauseText.slice(index + operatorToken.length).trim();
    return left && right ? { left, operator: operatorToken, right } : null;
  }

  /**
   * Checks whether token is a valid two-character comparison operator.
   */
  private static isTwoCharComparisonOperator(token: string): boolean {
    return token === '<=' || token === '>=' || token === '==' || token === '!=';
  }

  /**
   * Checks whether token is a valid one-character comparison operator.
   */
  private static isOneCharComparisonOperator(token: string): boolean {
    return token === '=' || token === '<' || token === '>';
  }

  /**
   * Returns the terminal attribute name from a dot-delimited attribute path.
   * Example: input1.Amount -> Amount.
   */
  private static getLastAttributePathSegment(attributePath: string): string {
    const segments = attributePath.split('.');
    const lastSegment = segments.pop();
    return lastSegment ?? '';
  }

  /**
   * Validates dot-delimited attribute paths where each segment is an identifier.
   * Accepted examples: Amount, input1.Amount, tenant.env.input1.Amount.
   */
  private static isValidAttributePath(attributePath: string): boolean {
    const normalizedPath = attributePath.trim();
    if (!normalizedPath) {
      return false;
    }

    const segments = normalizedPath.split('.');
    if (!segments.length) {
      return false;
    }

    return segments.every((segment) => this.isValidIdentifier(segment));
  }

  /**
   * Checks whether a token matches identifier rules: [A-Za-z_][A-Za-z0-9_]*.
   *
   * Implementation intentionally remains ASCII-only to preserve existing
   * parser behavior while using codePointAt for code scanning safety.
   */
  private static isValidIdentifier(identifier: string): boolean {
    if (!identifier) {
      return false;
    }

    const firstCode = this.getCodePointAt(identifier, 0);
    if (!this.isIdentifierStart(firstCode)) {
      return false;
    }

    for (let i = 1; i < identifier.length; i++) {
      if (!this.isIdentifierPart(this.getCodePointAt(identifier, i))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Read a code point at a given index using codePointAt.
   *
   * Returns -1 only for out-of-range indexes, which keeps identifier checks
   * deterministic and invalid-by-default.
   */
  private static getCodePointAt(value: string, index: number): number {
    return value.codePointAt(index) ?? -1;
  }

  /**
   * Returns true when a character code can start an identifier.
   */
  private static isIdentifierStart(charCode: number): boolean {
    const isUpper = charCode >= 65 && charCode <= 90;
    const isLower = charCode >= 97 && charCode <= 122;
    const isUnderscore = charCode === 95;
    return isUpper || isLower || isUnderscore;
  }

  /**
   * Returns true when a character code can appear after identifier start.
   */
  private static isIdentifierPart(charCode: number): boolean {
    const isDigit = charCode >= 48 && charCode <= 57;
    return this.isIdentifierStart(charCode) || isDigit;
  }

  /**
   * Remove one or more outer wrapping parenthesis pairs when they wrap the full clause.
   */
  private static stripOuterWrappingParentheses(clauseText: string): string {
    let text = clauseText.trim();

    while (this.hasFullOuterParentheses(text)) {
      text = text.slice(1, -1).trim();
    }

    return text;
  }

  private static parseCompareOperandParts(attribute: string, operator: string, value: string): CompareExpressionParts | null {
    const attr1 = toSafeText(attribute).trim();
    const logicalOperator = toSafeText(operator).trim();
    const normalizedValue = this.stripOuterWrappingParentheses(toSafeText(value).trim());
    const compareOperandRegex = /^(?:[A-Za-z_]\w*\.)?([A-Za-z_]\w*)\s*([+-])\s*(?:[A-Za-z_]\w*\.)?([A-Za-z_]\w*)$/;
    const match = compareOperandRegex.exec(normalizedValue);
    if (!match) {
      return null;
    }

    const attr2 = toSafeText(match[1]).trim();
    const arithmeticOperator = (match[2] ?? '') as '+' | '-';
    const attr3 = toSafeText(match[3]).trim();
    const supportedOperators = new Set(['==', '!=', '=', '>', '>=', '<', '<=']);
    if (!attr1 || !attr2 || !attr3 || !supportedOperators.has(logicalOperator)) {
      return null;
    }

    return {
      attr1,
      logicalOperator,
      attr2,
      arithmeticOperator,
      attr3,
    };
  }

  /**
   * Check whether the first and last characters are parentheses enclosing the full string.
   * Respects quoted strings and escape sequences to avoid misidentifying inner parens
   * as the outer wrapper boundary.
   *
   * @param text String to evaluate.
   * @returns True when the outermost `(...)` pair spans the entire text.
   */
  private static hasFullOuterParentheses(text: string): boolean {
    if (text.length < 2 || !text.startsWith('(') || !text.endsWith(')')) {
      return false;
    }

    let depth = 0;
    const quoteState: QuoteEscapeState = { inSingleQuote: false, inDoubleQuote: false, escaped: false };

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Advance quote/escape tracking; skip depth logic while inside quoted regions.
      const consumedByQuoting = this.advanceQuoteEscapeState(quoteState, char);
      if (consumedByQuoting || quoteState.inSingleQuote || quoteState.inDoubleQuote) {
        continue;
      }

      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      }

      // If depth reaches 0 before the final character, the outer parens do not wrap the full text.
      if (depth === 0 && i < text.length - 1) {
        return false;
      }
    }

    return depth === 0;
  }

  /**
   * Advances quote and escape tracking state for a single scanned character.
   *
   * Handles:
   * - Consuming a character that was marked as escaped by a prior backslash.
   * - Marking the next character as escaped when a backslash is found inside a quoted region.
   * - Toggling single-quote state on an unescaped `'` (when not inside a double-quote region).
   * - Toggling double-quote state on an unescaped `"` (when not inside a single-quote region).
   *
   * @param state Current quote/escape tracking state (mutated in place).
   * @param char The current character being scanned.
   * @returns True when the character was consumed by quote/escape logic and
   *          should not be processed further by the caller (e.g. depth tracking).
   */
  private static advanceQuoteEscapeState(state: QuoteEscapeState, char: string): boolean {
    if (state.escaped) {
      state.escaped = false;
      return true;
    }

    if ((state.inSingleQuote || state.inDoubleQuote) && char === '\\') {
      state.escaped = true;
      return true;
    }

    if (!state.inDoubleQuote && char === "'") {
      state.inSingleQuote = !state.inSingleQuote;
      return true;
    }

    if (!state.inSingleQuote && char === '"') {
      state.inDoubleQuote = !state.inDoubleQuote;
      return true;
    }

    return false;
  }

  private static getRowFieldValue(field: RuleSelectableValue | undefined): string {
    if (!field) {
      return '';
    }

    return typeof field === 'string' ? field : toSafeText(field.value);
  }

  private static unquoteValue(rawValue: string): string {
    const trimmed = rawValue.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      const unwrapped = trimmed.slice(1, -1);
      return unwrapped
        .replaceAll(ESCAPED_DOUBLE_QUOTE, '"')
        .replaceAll(ESCAPED_SINGLE_QUOTE, "'")
        .replaceAll(ESCAPED_BACKSLASH, SINGLE_BACKSLASH);
    }
    return trimmed;
  }

  /**
   * Detect logical connector text between two clauses.
   *
   * Supports symbolic operators (&&, ||) and word operators (And, Or).
   * Returns null when connector is ambiguous or unrecognized.
   *
   * @param tokenBetweenClauses Raw text between adjacent clauses.
   * @returns Logical operator name ('And' | 'Or') or null when not detected.
   */
  private static detectLogicalOperator(tokenBetweenClauses: string): LogicalOperatorValue | null {
    const token = tokenBetweenClauses.trim();
    if (token.includes('&&') || /\bAnd\b/i.test(token)) {
      return 'And';
    }
    if (token.includes('||') || /\bOr\b/i.test(token)) {
      return 'Or';
    }
    return null;
  }

  private static buildConditionString(attribute: string, operator: string, value: string | number | null | undefined): string {
    const safeAttribute = toSafeText(attribute).trim();
    const safeOperator = toSafeText(operator).trim();
    const safeValue = this.formatExpressionValue(value);
    return `(input1.${safeAttribute} ${safeOperator} ${safeValue})`;
  }

  private static formatExpressionValue(value: string | number | null | undefined): string {
    const strValue = toSafeText(value).trim();

    const compareOperandRegex = /^(?:[A-Za-z_]\w*\.)[A-Za-z_]\w*\s*[+-]\s*(?:[A-Za-z_]\w*\.)[A-Za-z_]\w*$/;
    if (compareOperandRegex.test(strValue)) {
      return strValue;
    }

    if (typeof value === 'number' || this.isNumericLiteral(strValue)) {
      return strValue;
    }

    if (/^(true|false)$/i.test(strValue)) {
      return strValue.toLowerCase();
    }

    const escaped = strValue.replaceAll(SINGLE_BACKSLASH, ESCAPED_BACKSLASH).replaceAll('"', ESCAPED_DOUBLE_QUOTE);
    return `"${escaped}"`;
  }

  private static toLogicalConnector(logicalName: string): string {
    if (/^or$/i.test(logicalName) || logicalName === '||') {
      return '||';
    }
    return '&&';
  }

  // returns AND as default logical operator
  static getDefaultLogicalOperator(): LogicalOperatorValue | null {
    return LogicalOperators['And'];
  }

  private static isNumericLiteral(value: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(value);
  }

  // To find the type of the attribute selected
  static attrKey(attr: RuleSelectableValue): string | null {
    if (!attr) return null;
    return typeof attr === 'string' ? attr : attr.value;
  }

}

export class RuleEngineDashboardHelper {
  /**
   * Builds the default dashboard column set.
   *
   * @param datePipe Date formatting helper used by the Last Modified column.
   * @param workflowId Active workflow identifier used for workflow-specific
   * decision formatting rules in the Decision column.
   */
  public static getDefaultColumns(datePipe: DatePipe, workflowId?: number): S1DataTableColumn[] {
    return [
      {
        displayName: 'Name',
        columnKey: 'Name',
        isSortable: false,
        columnType: 'html',
        columnWidth: '11%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 1,
        isClickable: true,
        formatter: (data: Rule) => this.getRuleName(data),
      },
      {
        displayName: 'Last Modified',
        columnKey: 'Last Modified',
        isSortable: false,
        formatter: (data: Rule) => this.getLastUpdated(data, datePipe),
        columnType: 'html',
        columnWidth: '10%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 0,
      },
      {
        displayName: 'Created by',
        columnKey: 'Created by',
        isSortable: false,
        columnType: 'html',
        columnWidth: '10%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 2,
        formatter: (data: Rule) =>  `<span class="s1-C-CG10">${data.createdBy}</span>`,
      },
      {
        displayName: 'Decision',
        columnKey: 'Decision',
        isSortable: false,
        formatter: (data: Rule) => this.getActionsDropdown(this.resolveDashboardDecision(data, workflowId)),
        columnType: 'html',
        columnWidth: '7%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 0,
      },
    ];
  }

  public static getActionColumn(isDraft: boolean): S1DataTableColumn {
    return {
        displayName: 'Action',
        columnKey: 'Action',
        isSortable: false,
        columnType: 'dropdown',
        columnWidth: '3%',
        headerAlignment: 'start',
        cellAlignment: 'center',
        dropdown: this.getTableDropdownMenu(isDraft),
        columnID: 3,
    };

  }

  public static getRuleName(data: Rule) {
    const mailTemplate = '<img src="/assets/mail_icon_16_16.svg" alt="mail">';
    const hasEmail = Array.isArray(data.emails) && data.emails.length > 0;    
    return`<div class="d-flex justify-content-between align-items-center">
        <span>${data.ruleName}</span>
        ${hasEmail ? mailTemplate : ''}
      </div>`;
  }

  public static getTableDropdownMenu(isDraft: boolean) {
    const baseMenu: S1Menu = {
      hasIcon: true,
      hasName: false,
      iconURL: '/assets/thread_more_icon_24_24.svg',
      hoverIcon: '/assets/thread_more_icon_hover_24_24.svg',
      subMenu: [
        {
          hasIcon: true,
          iconURL: '/assets/edit_icon_24_24.svg',
          hasName: true,
          displayName: 'Edit',
          onClickEmit: 'Edit',
          isS1Btn: false,
        },
        {
          hasIcon: true,
          iconURL: '/assets/duplicate_icon_24_24.svg',
          hasName: true,
          displayName: 'Duplicate',
          onClickEmit: 'Duplicate',
          isS1Btn: false,
        }
      ],
    };
    // based on the current tab, we will alter the names of button & its action
    baseMenu.subMenu.push({
      hasIcon: false,
          hasName: true,
          displayName: isDraft ? 'Publish' : 'Move to Draft',
          isS1Btn: true,
          s1BtnType: 'secondary-filled',
          onClickEmit: isDraft ? 'MoveToPublish' : 'MoveToDraft',
    });

    return baseMenu;
  }

  public static getLastUpdated(data: Rule, datePipe: DatePipe) {
    const date = data?.updatedOn ?? data.createdOn!;
    return `
        <span class="s1-C-Stone"> ${DashboardHelper.getOrderDateTime(date, 'date', datePipe)} | ${DashboardHelper.getOrderDateTime(date, 'time', datePipe)} | ${UTC_TIMEZONE}</span>
      `;
  }

  /**
   * Resolves dashboard Decision value with workflow-specific fallback rules.
   *
   * CBC-only behavior:
   * - If `decision` is null/undefined/empty, fallback to `successEvent`.
   *
   * Non-CBC workflows preserve existing behavior and use `decision` as-is.
   */
  private static resolveDashboardDecision(data: Rule, workflowId?: number): string {
    const decisionValue = (data as any)?.decision;

    if (workflowId === CBC_RULE_ENGINE_WORKFLOW_ID) {
      const isDecisionEmpty =
        decisionValue === null
        || decisionValue === undefined
        || (typeof decisionValue === 'string' && decisionValue.trim().length === 0);

      if (isDecisionEmpty) {
        const successEventValue = (data as any)?.successEvent;
        if (typeof successEventValue === 'string') {
          return successEventValue;
        }
        return successEventValue ?? '';
      }
    }

    return decisionValue;
  }

  public static getActionsDropdown(action: string) {
    const validActions = ['Approve', 'Decline', 'PendingApproval'];
    const hasIcon = validActions.includes(action);
    const parts: string[] = [];
    if (hasIcon) {
      parts.push(`<img src="/assets/${action}.svg" alt="${action.toLowerCase()}">`);
    }
    parts.push(action);

    return `<div class="d-flex align-items-center gap-2">${parts.join(' ')}</div>`;

  }
}
