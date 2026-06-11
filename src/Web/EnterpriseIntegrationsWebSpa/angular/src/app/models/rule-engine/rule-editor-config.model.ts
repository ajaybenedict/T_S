import { PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface UIRuleConfigApiResponse {
  /** Raw field metadata returned by the UI config API. */
  attributeList: RuleEditorField[];
  /** Named datasource dictionary used by attributes and shell features. */
  dataSource: Record<string, any>;
}

export interface RuleEditorField {
  id: number;
  applicationId: number;
  workflowId: number;
  key: string;
  title: string;
  dataType: 'decimal' | 'int' | 'string' | 'bool' | 'select';
  usedIn: 'expressionBuilder' | 'actionBuilder';
  validations: {
    decimal?: { min: number | null; max: number | null };
    int?: { min: number | null; max: number | null };
    string?: { minLength: number | null; maxLength: number | null };
  } | null;
  allowedOverrides: string[];
  rulePrecedence: number | null;
  dataSource: string | null;
  values: JsonValue;
  isComparable: boolean | null;
  application: JsonValue;
}

export interface RuleEditorSchema {
  /** Current workflow id for which schema is adapted. */
  workflowId: number;
  /** Expression-builder attributes normalized for component consumption. */
  expressionAttributes: NormalizedAttribute[];
  /** Optional action-builder attribute normalized for component consumption. */
  actionAttribute: NormalizedAttribute | null;
  /** Operator sets resolved by adapter from application conventions. */
  operatorSets: OperatorSet[];
  /** Datasource map preserved from API response. */
  dataSources: Record<string, any>;
}

export interface NormalizedAttribute {
  key: string;
  title: string;
  dataType: 'decimal' | 'int' | 'string' | 'bool' | 'select';
  inputType: 'text' | 'number' | 'decimal' | 'dropdown';
  allowedOverrides: string[];
  dataSourceRef: string | null;
  isComparable: boolean;
  validations?: {
    decimal?: { min?: number; max?: number };
    int?: { min?: number; max?: number };
    string?: { minLength?: number; maxLength?: number };
  };
}

export interface OperatorSet {
  /** Normalized attribute type bucket this operator set applies to. */
  type: 'number' | 'string' | 'bool' | 'select';
  /** Ordered list of operators to render/resolve. */
  operators: string[];
}

/**
 * Describes a parent-child attribute dependency used to resolve dropdown cascades.
 *
 * Example: Region -> Country, where Country options depend on the Region row value.
 */
export interface CascadeRule {
  /** Parent attribute key that drives child dropdown options. */
  parentAttributeKey: string;
  /** Child attribute key that depends on parent selection. */
  childAttributeKey: string;
  /** Operators interpreted as include semantics for child option resolution. */
  includeOperators: Array<string | null>;
  /** Operators interpreted as exclude semantics for child option resolution. */
  excludeOperators: string[];
  /** Optional override scopes where default child filtering is applied. */
  filterOverrideKey: string[] | null;
  /** Whether child rows must be reset when parent row changes. */
  resetChildOnParentChange: boolean;
}

/**
 * Runtime context passed to a cascade resolver so option calculation remains app-specific
 * while the component stays generic.
 */
export interface CascadeResolverContext {
  /** Selected override value in the parent form. */
  selectedOverride: string;
  /** Selected level values (for scoped default filtering). */
  selectedLevelValues: string[];
  /** Raw source object required by concrete resolver implementation. */
  sourceData: unknown;
}

/**
 * Adapter contract for resolving dropdown values for parent-child cascade rules.
 */
export interface CascadeOptionsResolver {
  resolveChildOptions(
    rule: CascadeRule,
    parentValue: string,
    operator: string | null,
    context: CascadeResolverContext
  ): SelectDropdown[];

  resolveDefaultChildOptions(
    rule: CascadeRule,
    context: CascadeResolverContext
  ): SelectDropdown[];
}

export type RuleEditorDialogConfigKey = 'createDraft' | 'createPublish' | 'edit' | 'moveToDraft' | 'moveToPublish';

/**
 * Semantic dialog action tokens emitted by the confirmation dialog component.
 */
export interface RuleEditorDialogActions {
  /** Dialog action token for create publish flow. */
  publish: string;
  /** Dialog action token for create draft flow. */
  saveDraft: string;
  /** Dialog action token for edit->create-draft flow. */
  editDraft: string;
  /** Dialog action token for edit->publish flow. */
  editPublish: string;
}

/**
 * Shell-level configuration used by the parent edit screen.
 *
 * This keeps application-specific UI behavior out of the container component.
 */
export interface RuleEditorShellConfig {
  /** Toggle for Compare rule type visibility in edit and view experiences. */
  enableCompareRuleType: boolean;
  /** Override values that require level-value collection in the parent form. */
  overridesRequiringLevelValue: string[];
  /** Override values that use geo dropdown selector (country/region). */
  geoSelectorOverrideKeys: string[];
  /** Override values that should render region options in the geo selector. */
  regionSelectorOverrideKeys: string[];
  /** Override values that use reseller free-text input. */
  resellerOverrideKeys: string[];
  /** Datasource key that contains geo payload; null disables geo feature. */
  geoDataSourceKey: string | null;
  /** Max reseller input length; null means reseller input is not used. */
  resellerMaxLength: number | null;
  /** Toggle for alert recipients section in parent editor UI. */
  emailRecipientsEnabled: boolean;
  /** Allowed email domains used by recipient validator. */
  allowedEmailDomains: string[];
  /** Application id used for create/update rule API calls. */
  applicationId: number;
  /** Semantic action tokens emitted by workflow dialog interactions. */
  dialogActions: RuleEditorDialogActions;
  /** Dialog content/labels keyed by semantic dialog state. */
  dialogConfig: Record<RuleEditorDialogConfigKey, Omit<PPCDialogData, 'type'>>;
  /** Controls whether the same attribute can be used in multiple expressions. When false, once an attribute is selected in one expression, it becomes unavailable in the attribute list for other expressions. */
  allowDuplicateAttributes: boolean;
  /**
   * When true, replaces the action dropdown in the rule editor with a decimal number
   * text input for workflows that require a numeric cost adjustment value.
   *
   * The input value is serialized as a JSON string `{"costAdjustment": N}` when sent
   * to the API, and parsed back to the raw decimal string when hydrating an existing rule
   * in edit mode.
   *
   * Affects: rule-edit editor UI, API serialization, dashboard view display.
   */
  costAdjustmentMode: boolean;
}

export interface WorkflowBehaviorStrategy {
  /** Unique identifier of the workflow this strategy applies to. */
  workflowId: number;
  /**
   * Returns the list of attribute keys that should be excluded from the expression
   * picker for the given override value.
   *
   * @param override - The currently selected override (e.g. 'Country', 'Reseller')
   * @param currentAttributes - Optional list of attribute keys already present in expressions
   * @returns Array of attribute keys to hide from the picker
   */
  getAttributeListForOverride: (override: string, currentAttributes?: string[]) => string[];
  /** When true, changing the Region selection should reset any associated Country selection. */
  shouldResetCountryWhenRegionChanges: boolean;
  /**
   * Validates all expression rows for the given override and returns a result object.
   * Returns `{ valid: false, error }` when validation fails so callers can surface the message.
   *
   * @param expressions - Current expression rows from the form
   * @param override - The currently selected override value
   * @returns Validation result with an optional error message
   */
  validateExpressions: (expressions: any[], override: string) => { valid: boolean; error?: string };
}

export interface RuleEditComponentConfig {
  /** Generic normalized schema used by rule-edit component. */
  schema: RuleEditorSchema;
  /** Workflow-specific behavior strategy for validation/filtering. */
  behavior: WorkflowBehaviorStrategy;
  /** Parent->child cascade definitions; empty when workflow has no cascades. */
  cascadeRules: CascadeRule[];
  /** Resolver implementation for cascade rules; null when not applicable. */
  cascadeResolver: CascadeOptionsResolver | null;
  /** Parent-shell configuration consumed by edit-rule-detail component. */
  shellConfig: RuleEditorShellConfig;
}
