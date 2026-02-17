import { SelectDropdown } from "../select-dropdown.interface";

// Base interface for named values like RuleLevel and LogicalOperator
export interface NamedValue {
  id?: number;
  name: string;
}
// Rule Level (inherits from NamedValue)
export type RuleLevel = NamedValue;
// Logical Operator (inherits from NamedValue)
export type LogicalOperator = NamedValue;

export type RuleExpressionRowType = string | SelectDropdown | null;

// Expression within a rule
export interface RuleExpression {
  attribute: string;
  value: string;
  // operator in the expression (input.Amount '==' 50)
  operator: string; 
  // Operator between expressions (input.Amount == 50 '&&' input.Qty < 100). 
  // This will be used only if there is a valid second row.
  logicalOperator: LogicalOperator | null; // null for last row
}

// Used as Create Rule request payload && GetRuleByID response payload
export interface RuleDetail {
  workflowId: number;
  name: string;
  purpose: string;
  overrideLevel: RuleLevel;
  expressions: RuleExpression[];
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
  purpose: string;
  enabled: boolean;
  ruleName: string;
  emails: string[] | null;
}

// For creating dynamic expressions in UI
export interface RuleExpressionUI {
  logicalOperator?: LogicalOperator; // will not be available for first row
  attribute: RuleExpressionRowType;
  value: RuleExpressionRowType;
  operator: RuleExpressionRowType;
}
