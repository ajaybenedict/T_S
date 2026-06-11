import { SelectDropdown } from "../select-dropdown.interface";

// Logical Operator values supported in rule expressions
export type LogicalOperatorValue = 'And' | 'Or';

export type CompareCriteriaType = 'Region' | 'Country';

/**
 * Shared dropdown-bound value type used by rule-engine forms.
 *
 * Values can be:
 * - raw string (API/edit hydration paths)
 * - SelectDropdown object (UI-selected option)
 * - null (empty state)
 */
export type RuleSelectableValue = string | SelectDropdown | null;

// Used as Create Rule request payload && GetRuleByID response payload
export interface RuleDetail {
  workflowId: number;
  name: string;
  purpose: string;
  overrideLevelName: string;
  expression: string;
  action: string;
  isDraft?: boolean;
  createdOn?: string | null;    // DateTime? → string (ISO)
  createdBy?: string | null;
  updatedOn?: string | null;    // DateTime? → string (ISO)
  updatedBy?: string | null;
  levelValues: string[];
  emails: string[] | null;
}
// Update Rule request payload
export interface UpdateRuleRequest extends RuleDetail {
  ruleId: string;
}
// Get Rules request payload
export interface GetRulesRequest {
  WorkflowId: number;
  ApplicationId: number;
  SearchTerm?: string;
  enabled?: boolean;
  PageSize?: number;
  PageNumber?: number;
  SortBy?: string; // column names based on Rule interface
  SortOrder?: 'asc' | 'desc';
}
// Get Rules response
export interface Rule {
  id: string;
  createdOn?: string | null;    // DateTime? → string (ISO)
  createdBy?: string | null;
  updatedOn?: string | null;    // DateTime? → string (ISO)
  updatedBy?: string | null;
  decision: string;  
  successEvent: string | null;
  actions: string[] | null;
  errorMessage: string;
  expression: string;
  ruleExpressionType: number;
  localParams: null;
  operator: null;
  properties: null;
  rules: null;
  workflowsToInject: null;
  purpose: string;
  enabled: boolean;
  ruleName: string;
  emails: string[] | null;
}

// For creating dynamic expressions in UI
export interface RuleExpressionUI {
  logicalOperator?: LogicalOperatorValue; // will not be available for first row
  attribute: RuleSelectableValue;
  value: RuleSelectableValue;
  operator: RuleSelectableValue;
}

export enum RuleTypeEnum {
  Conditional = 'Conditional',
  Compare = 'Compare',
}

export type RuleTypeTabConfig = {
  [key in RuleTypeEnum]: {
    displayName: string;
    onClickEvent: string;
  }
}