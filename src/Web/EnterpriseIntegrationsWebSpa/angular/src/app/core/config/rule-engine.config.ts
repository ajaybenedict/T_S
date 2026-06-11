import { PPCDialogData } from "src/app/models/ppc-dialog-data.model";
import { RuleTypeEnum, RuleTypeTabConfig } from "src/app/models/rule-engine/rule-engine";
import { SelectDropdown } from "src/app/models/select-dropdown.interface";

export const C3_RULE_ENGINE_WORKFLOW_ID = 1;
export const CBC_RULE_ENGINE_WORKFLOW_ID = 2;

export type C3LogicalRowOperators = 'And' | 'Or';
export type RuleExpressionComparators = '<' | '>' | '<='| '>=' | '==' | '!=';


// Predefined Boolean Dropdown
export const boolOptions: SelectDropdown[] = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
];

// Predefined Logical Operators (for backward compatibility; prefer LogicalOperatorValue type)
export const LogicalOperators = {
  And: 'And' as const,
  Or: 'Or' as const,
} as const;

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

export const ruleTypeTabConfig: RuleTypeTabConfig = {
    [RuleTypeEnum.Conditional]: {
        displayName: 'Conditional',
        onClickEvent: 'Conditional',
    },
    [RuleTypeEnum.Compare]: {
        displayName: 'Compare', 
        onClickEvent: 'Compare',
    }
};