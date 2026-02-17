import { DatePipe } from "@angular/common";
import { C3_RULE_ENGINE_WORKFLOW_ID, C3OverrideLevels, c3RuleEngineAttributeList, LogicalOperators, operatorsTypeMapping } from "../core/config/rule-engine.config";
import { CountryRegionResponse } from "../models/ppc/country-region-api.interface";
import { LogicalOperator, Rule, RuleDetail, RuleExpression, RuleExpressionRowType, RuleExpressionUI } from "../models/rule-engine/rule-engine";
import { SelectDropdown } from "../models/select-dropdown.interface";
import { S1DataTableColumn } from "../models/s1/s1-data-table.interface";
import { S1Menu } from "../models/s1/s1-menu.interface";
import { DashboardHelper } from "../ppc/dashboard/dashboard-helper";

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
    expressions: RuleExpressionFormUI[];
}

interface RuleExpressionFormUI {
    logicalOperator: LogicalOperator | null; // will not be available for first row
    attribute: SelectDropdown;
    value: string | SelectDropdown;
    operator: SelectDropdown;
}

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
    static getAPIRuleformat(formValue: UIParentForm, isDraft: boolean, mode: string): RuleDetail {
        const datatoSend: RuleDetail = {
            workflowId: C3_RULE_ENGINE_WORKFLOW_ID,
            name: formValue.name,
            purpose: formValue.purpose,
            overrideLevel: { name: formValue.override?.value ?? formValue.override?.value },
            levelValues: formValue.levelValue ?? ['Global'], // if levelValue is not present then it is Global & have to hardcode it
            emails: Array.isArray(formValue.alertRecipients) ? formValue.alertRecipients : [],
            action: formValue.childForm.action?.value ?? formValue.childForm.action,
            expressions: RuleEngineExpressionHelper.uiToApi(formValue.childForm.expressions),
            isDraft,
        };
        return datatoSend;
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

    /**
     * To filter the attribute type based on the override selected & convert to SelectDropdown type for dropdown's input.
     * @param values
     * @param selectedOverride
     * @returns SelectDropdown[]
     */
    static getAttributeDropdown(values: string[], selectedOverride: C3OverrideLevels): SelectDropdown[] {
        let filteredValues = values;
        switch (selectedOverride) {
          case 'Country':
            filteredValues = filteredValues.filter(el => !['Country', 'Region'].includes(el));
            break;
          case 'CountryGroup':
            filteredValues = filteredValues.filter(el => el !== 'Region');
            break;
          case 'Reseller':
            filteredValues = filteredValues.filter(el => !['ResellerID', 'ResellerName'].includes(el));
            break;
        }
        // For 'Global' we do not filter any values & retuyrn as it is.
        return filteredValues.map(val => ({ label: val, value: val }));
    }
}

/**
 * Helper for converting between API model (RuleExpression) and UI model (RuleExpressionUI).
 * Mapping rules:
 * - API => UI:
 *    UI[i].logicalOperator = (i === 0) ? undefined : API[i-1].logicalOperator ?? undefined
 * - UI => API:
 *    API[i].logicalOperator = (i === last) ? null : (UI[i+1].logicalOperator ?? null)
 */
export class RuleEngineExpressionHelper {
  /**
 * Convert API model to UI model. Use only in view mode
 * @param apiExpressions API array (RuleExpression[])
 */
  static apiToUi(apiExpressions: RuleExpression[]): RuleExpressionUI[] {
    if (!Array.isArray(apiExpressions)) {
      return [];
    }

    return apiExpressions.map((apiItem, index) => {
      // For UI row i:
      // - logicalOperator comes from API[i-1]
      const lgOpFromPrev = index === 0 ? undefined : (apiExpressions[index - 1].logicalOperator ?? undefined);

      return {
        logicalOperator: lgOpFromPrev,
        attribute: apiItem.attribute,
        operator: apiItem.operator,
        value: apiItem.value
      };
    });
  }
/**
 * Convert API model to UI model. Use only in edit mode of form with patchValue
 * @param apiData { expressions: RuleExpression[], action: string }
 */
  static apiToUiForm(apiData: { expressions: RuleExpression[], action: string }) {
    let expressionsToSend: RuleExpressionUI[] = [];
    const apiExpressions = apiData.expressions;
    apiExpressions.forEach((expr, i, arr) => {
      const foundedAttr = [...c3RuleEngineAttributeList.common, ...c3RuleEngineAttributeList.reseller, ...c3RuleEngineAttributeList.creditFlags].find(el => el.toLowerCase() == expr.attribute.toLowerCase());
      const foundedOperator = {label: expr.operator, value: expr.operator};
      const foundedValue = ['Region', 'Country', 'CIS_Restricted', 'CIS_Discontinued'].includes(expr.attribute) ? { label: expr.value, value: expr.value } : expr.value;
      expressionsToSend.push({
        attribute: foundedAttr ? { label: expr.attribute, value: expr.attribute } : null,
        operator: foundedOperator,
        value: foundedValue,
        logicalOperator: expr.logicalOperator ?? undefined
      });
    });
    const foundedAction = RuleEngineHelper.getActionListDropdown().find(el => el.value == apiData.action) ?? null;
    const transformed = expressionsToSend.map((uiItem, i, arr) => {
      const transformedLogicalOperator = (i == 0) ? null : arr[i - 1]?.logicalOperator ?? null;
      return {
        attribute: uiItem.attribute,
        operator: uiItem.operator,
        value: uiItem.value,
        logicalOperator: this.normalizeLogical(transformedLogicalOperator)
      };
    });
    return { expressions: transformed, action: foundedAction };
  }

  static normalizeLogical (op: any): LogicalOperator | null {
      if (!op) return null;
      if (typeof op === 'string') {
        return { name: op };
      }
      if (typeof op === 'object' && 'name' in op) {
        return op as LogicalOperator;
      }
      return null;
  };

  /**
   * Convert UI form model to API model
   * @param uiExpressions UI array (RuleExpressionUI[])
   */
  static uiToApi(uiExpressions: RuleExpressionFormUI[]): RuleExpression[] {
    if (!Array.isArray(uiExpressions) || uiExpressions.length === 0) {
      return [];
    }

    return uiExpressions.map((uiItem, i, arr) => {
      const isLast = i === arr.length - 1;
      const nextLogical = isLast ? null : arr[i + 1]?.logicalOperator ?? null;
      return {
        attribute: uiItem.attribute?.value ?? uiItem.attribute,
        operator: uiItem.operator?.value ?? uiItem.operator,
        value: typeof uiItem.value === 'string' ? uiItem.value : uiItem.value.value,
        logicalOperator: this.normalizeLogical(nextLogical)
      };
    });
  }

  // returns AND as default logical operator
  static getDefaultLogicalOperator(): string | null {
    return LogicalOperators['And'].name;
  }

  // To find the type of the attribute selected
  static attrKey(attr: RuleExpressionRowType): string | null {
    if (!attr) return null;
    return typeof attr === 'string' ? attr : attr.value;
  }

  // check if selected attribute will falls under numeric category
  static isNumericAttribute(attr: RuleExpressionRowType): boolean {
    const key = this.attrKey(attr);
    return ['Amount', 'Qty', 'UnbilledUsage', 'TotalCredit', 'ArBalance', 'Available', 'CreditLimit', 'CIS_PastDueAmount', 'CIS_PendingAmount'].includes(key ?? '');
  }

  // below logic will decide the type of Value field in rule edit - return boolean based on selected attribute
  static isNumericValueField(attr: RuleExpressionRowType): boolean {
    const key = this.attrKey(attr);
    return ['ResellerID', 'Qty'].includes(key ?? '');
  }

  static isDecimalValueField(attr: RuleExpressionRowType): boolean {
    const key = this.attrKey(attr);
    return ['Amount', 'UnbilledUsage', 'TotalCredit', 'ArBalance', 'Available', 'CreditLimit', 'CIS_PastDueAmount', 'CIS_PendingAmount'].includes(key ?? '');
  }

  static isStringValueWithSpecialCharsField(attr: RuleExpressionRowType): boolean {
    const key = this.attrKey(attr);
    return ['ResellerName'].includes(key ?? ''); // ResellerName may contain - numbers, alphabets, special chars
  }

}

export class RuleEngineDashboardHelper {
  public static getDefaultColumns(datePipe: DatePipe): S1DataTableColumn[] {
    return [
      {
        displayName: 'Name',
        columnKey: 'Name',
        isSortable: false,
        columnType: 'html',
        columnWidth: '13%',
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
        columnWidth: '14%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 2,
        formatter: (data: Rule) =>  `<span class="s1-C-CG10">${data.createdBy}</span>`,
      },
      {
        displayName: 'Decision',
        columnKey: 'Decision',
        isSortable: false,
        formatter: (data: Rule) => this.getActionsDropdown(data.decision),
        columnType: 'html',
        columnWidth: '5%',
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
        <span class="s1-C-Stone"> ${DashboardHelper.getOrderDateTime(date, 'date', datePipe)} | ${DashboardHelper.getOrderDateTime(date, 'time', datePipe)}</span>
      `;
  }

  public static getActionsDropdown(action: string) {
    const validActions = ['Approve', 'Decline'];
    const hasIcon = validActions.includes(action);
    const parts: string[] = [];
    if (hasIcon) {
      parts.push(`<img src="/assets/${action}.svg" alt="${action.toLowerCase()}">`);
    }
    parts.push(action);

    return `<div class="d-flex align-items-center gap-2">${parts.join(' ')}</div>`;

  }
}
