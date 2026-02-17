import { approvalTypeFilterConfig } from "src/app/core/config/approval-type-filter.config";
import { ppcFilterButtonDataConfig } from "src/app/core/config/ppc-side-panel-filter.config";
import { CountryRegionResponse } from "src/app/models/ppc/country-region-api.interface";
import { PPCFilterTypeEnum } from "src/app/models/ppc/ppc-filter.interface";
import { S1FilterButtons } from "src/app/models/s1/s1-filter-buttons.interface";
import { S1DescriptionCheckbox, S1GroupCheckbox } from "src/app/models/s1/s1-filter-checkbox.interface";
import { S1FilterNumericFieldInput } from "src/app/models/s1/s1-filter-numeric-field.interface";

export class SidePanelHelper {
    public static getButtons() {
        const data: { [key in PPCFilterTypeEnum]: S1FilterButtons } = {
            Country: {
                displayName: ppcFilterButtonDataConfig[PPCFilterTypeEnum.Country].displayName,
                onClickEvent: ppcFilterButtonDataConfig[PPCFilterTypeEnum.Country].onClickEvent,
                selected: false,
                type: 'filter',
            },
            ApprovalType: {
                displayName: ppcFilterButtonDataConfig[PPCFilterTypeEnum.ApprovalType].displayName,
                onClickEvent: ppcFilterButtonDataConfig[PPCFilterTypeEnum.ApprovalType].onClickEvent,
                selected: false,
                type: 'filter'
            },
            OrderValue: {
                displayName: ppcFilterButtonDataConfig[PPCFilterTypeEnum.OrderValue].displayName,
                onClickEvent: ppcFilterButtonDataConfig[PPCFilterTypeEnum.OrderValue].onClickEvent,
                selected: false,
                type: 'filter',
            },
        };
        return data;
    }

    private static normalizeKey(key: string | number): number {
      return typeof key === 'string' ? Number.parseInt(key, 10) : key;
    }

    private static buildApprovalCheckbox(item: typeof approvalTypeFilterConfig[number], checked = false): S1DescriptionCheckbox {
      return {
        displayName: item.displayName,
        description: item.description,
        key: item.key,
        checked
      };
    }

    public static getApprovalTypeData(): S1DescriptionCheckbox[] {
      return approvalTypeFilterConfig.map(item =>
        this.buildApprovalCheckbox(item)
      );
    }

    public static getSelectedApprovalTypeData(approvalTypes: number[]): S1DescriptionCheckbox[] {
      const selectedSet = new Set(approvalTypes);
      return approvalTypeFilterConfig.map(item =>
        this.buildApprovalCheckbox(
          item,
          selectedSet.has(this.normalizeKey(item.key))
        )
      );
    }

    private static getBaseMinMaxData(): Omit<S1FilterNumericFieldInput, 'min' | 'max'> {
      return {
        description: 'Enter the minimum and maximum values for the order value range.',
        minPlaceholder: '0.00',
        maxPlaceholder: '0.00',
        maxTitle: 'Maximum Value',
        minTitle: 'Minimum Value'
      };
    }

    public static getMinMaxData(min = 0, max = 0): S1FilterNumericFieldInput {
      return {
        ...this.getBaseMinMaxData(),
        min,
        max
      };
    }

    public static mapCountryApiToGroupCheckbox(apiData: CountryRegionResponse[]): S1GroupCheckbox[] {
      return apiData
        .filter(region => region.regionName !== 'Unmapped')
        .map(region => ({
          groupTitle: region.regionName,
          id: region.regionId,
          checkboxes: region.countries.map(country => ({
            displayName: country.name,
            key: country.id,
            checked: false,
            disabled: false
          }))
        }));
    }

    public static applySelectedCountries(groups: S1GroupCheckbox[], selectedCountryIds: number[]): S1GroupCheckbox[] {
      if (!selectedCountryIds?.length) return groups;
      const selectedSet = new Set(selectedCountryIds);
      return groups?.map(group => ({
        ...group,
        checkboxes: group.checkboxes.map(cb => ({
          ...cb,
          checked: selectedSet.has(this.normalizeKey(cb.key))
        }))
      }));
    }

    public static updateButtons(buttons: { [key in PPCFilterTypeEnum]: S1FilterButtons }, filterCounts: { [key in PPCFilterTypeEnum]: number }) {
        const filterTypes: PPCFilterTypeEnum[] = [
            PPCFilterTypeEnum.Country,
            PPCFilterTypeEnum.ApprovalType,
            PPCFilterTypeEnum.OrderValue
        ];
        for(const type of filterTypes) {
            if(filterCounts[type]) {
                buttons[type].selectedCount = filterCounts[type];
                buttons[type].hasCloseBtn = true;
                buttons[type].closeBtnClickEvent = ppcFilterButtonDataConfig[type].onClickEvent;
            } else {
                delete buttons[type].selectedCount;
                delete buttons[type].hasCloseBtn;
                delete buttons[type].closeBtnClickEvent;
            }
        };
        return buttons;
    }

    public static getSelectedCountryId(data: S1GroupCheckbox) {
        let selectedCountries = data.checkboxes.filter(el => el.checked);
        if(selectedCountries.length == 0) return [];
        return selectedCountries.map(el => Number(el.key));
    }
}