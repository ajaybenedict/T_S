import { PPCDialogData } from "src/app/models/ppc-dialog-data.model";
import { LogicalOperator, RuleLevel } from "src/app/models/rule-engine/rule-engine";
import { SelectDropdown } from "src/app/models/select-dropdown.interface";

export const C3_RULE_ENGINE_WORKFLOW_ID = 1;
export type C3OverrideLevels = 'Global' | 'CountryGroup' | 'Country' | 'Reseller';
export type C3LogicalRowOperators = 'And' | 'Or';
export type RuleExpressionComparators = '<' | '>' | '<='| '>=' | '==' | '!=';

// Alert Recipients: allowed email domains (lowercase). Example: ['tdsynnex.com']
export const c3RuleEngineAlertRecipientAllowedDomains: readonly string[] = ['tdsynnex.com', 'techdata.com', 'myTecD.com'];
// Override dropdown data to be used inside C3 dashboard.
export const c3RuleEngineOverrideData: SelectDropdown[] = [
    {
        label: 'Global',
        value: 'Global'
    },
    {
        label: 'Region',
        value: 'CountryGroup'
    },
    {
        label: 'Country',
        value: 'Country'
    },
    {
        label: 'Reseller',
        value: 'Reseller'
    },
];

// Predefined Rule Levels
export const RuleLevels: Record<C3OverrideLevels, RuleLevel> = {
  Global: { id: 1, name: "Global" },
  CountryGroup: { id: 2, name: "CountryGroup" },
  Country: { id: 3, name: "Country" },
  Reseller: { id: 4, name: "Reseller" },
};

// Predefined Boolean Dropdown
export const boolOptions: SelectDropdown[] = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
];

// Predefined Logical Operators
export const LogicalOperators: Record<string, LogicalOperator> = {
  And: { id: 1, name: "And" },
  Or: { id: 2, name: "Or" },
};
// Attribute list in the rule
export const c3RuleEngineAttributeList = {
    common: [ "Amount", "ResellerName", "ResellerID", "UnbilledUsage", "Qty", "TotalCredit", "ArBalance", "Available", "CreditLimit", "CIS_PastDueAmount", "CIS_PendingAmount" ],
    creditFlags: ["CIS_Restricted", "CIS_Discontinued"],
    // to be use only when reseller override is selected
    reseller: ["Region", "Country"],
};

// For showing operator dropdown in UI
export const operatorsTypeMapping: { operators: RuleExpressionComparators[], type: 'number' | 'string' }[] = [
    { operators: ["!=", "<", "<=", ">", ">=", "=="], type: 'number'},
    { operators: ["!=", "=="], type: "string" },
];

// For dialog boxes
export type c3RuleEngineDialogType = 'createDraft' | 'createPublish' | 'edit' | 'moveToDraft' | 'moveToPublish';
export const c3RuleEngineDialogConfig: Record<c3RuleEngineDialogType, Omit<PPCDialogData, 'type'>> = {
    /* Create new Rule */
    createDraft: {
        header: 'Save Draft',
        content: `The rule will be saved as draft. You can edit and republish it later.`,
        primaryBtnAction: 'SaveDraft',
        secondaryBtnAction: 'Cancel',
        primaryBtnName: 'Confirm',
        secondaryBtnName: 'Cancel',
    },
    createPublish: {
        header: 'Publish Rule',
        content: `Publishing this rule will apply changes right away. Review it to ensure it works as expected.`,
        primaryBtnAction: 'Publish',
        secondaryBtnAction: 'GoBack',
        primaryBtnName: 'Publish Now',
        secondaryBtnName: 'Go Back',
    },
    /* Edit Rule */
    edit: {
        header: 'Save Changes',
        content: `Save your changes to the published rule, or create a draft copy to work on later.`,
        primaryBtnName: 'Confirm',
        hasRadioButton: true,
        radioLabel: 'Confirm your action to proceed',
        radioGroup: [
            {
                displayName: 'Save and Publish',
                value: 'EditPublish',
            },
            {
                displayName: 'Create new draft copy',
                value: 'EditDraft',
            },
        ]
    },
    /* Move to Draft */
    moveToDraft: {
        header: 'Move to Draft',
        content: `Moving this rule to Draft will pause it, and it will no longer affect your data. You can republish it anytime.`,
        primaryBtnAction: 'MoveToDraft',
        secondaryBtnAction: 'Cancel',
        primaryBtnName: 'Confirm',
        secondaryBtnName: 'Cancel',
    },

    // Move to Publish
    moveToPublish: {
        header: 'Move to Publish',
        content: `Moving this rule to Publish will apply changes right away. Review it to ensure it works as expected.`,
        primaryBtnAction: 'MoveToPublish',
        secondaryBtnAction: 'Cancel',
        primaryBtnName: 'Confirm',
        secondaryBtnName: 'Cancel',
    }
};

