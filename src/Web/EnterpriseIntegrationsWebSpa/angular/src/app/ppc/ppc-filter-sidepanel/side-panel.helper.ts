import { approvalTypeFilterConfig, billingTermFilterConfig, ppcFilterButtonDataConfig, resellerStatusFilterConfig } from "src/app/core/config/ppc-side-panel-filter.config";
import { CountryRegionResponse } from "src/app/models/ppc/country-region-api.interface";
import { BillingTermFilterEnum, PPCFilterTypeEnum, ResellerStatusFilterEnum } from "src/app/models/ppc/ppc-filter.interface";
import { OrderRequest } from "src/app/models/ppc/order-api.interface";
import { S1FilterButtons } from "src/app/models/s1/s1-filter-buttons.interface";
import { S1DescriptionCheckbox, S1GroupCheckbox } from "src/app/models/s1/s1-filter-checkbox.interface";
import { S1FilterNumericFieldInput } from "src/app/models/s1/s1-filter-numeric-field.interface";

export class SidePanelHelper {
    /**
     * Billing term options (Standard/Multi-Year) are mutually exclusive
     * because they map to a single boolean value on the API.
     */
    private static readonly billingTermKeys = new Set<BillingTermFilterEnum>([
      BillingTermFilterEnum.Standard,
      BillingTermFilterEnum.MultiYear,
    ]);

    /**
     * Reseller status options (On Hold/Discontinued) are independent
     * and can be selected together.
     */
    private static readonly resellerStatusKeys = new Set<ResellerStatusFilterEnum>([
      ResellerStatusFilterEnum.OnHold,
      ResellerStatusFilterEnum.Discontinued,
    ]);

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
            BillingTerm: {
              displayName: ppcFilterButtonDataConfig[PPCFilterTypeEnum.BillingTerm].displayName,
              onClickEvent: ppcFilterButtonDataConfig[PPCFilterTypeEnum.BillingTerm].onClickEvent,
              selected: false,
              type: 'filter',
            },
            ResellerStatus: {
              displayName: ppcFilterButtonDataConfig[PPCFilterTypeEnum.ResellerStatus].displayName,
              onClickEvent: ppcFilterButtonDataConfig[PPCFilterTypeEnum.ResellerStatus].onClickEvent,
              selected: false,
              type: 'filter',
            },
        };
        return data;
    }

    private static normalizeKey(key: string | number): number {
      return typeof key === 'string' ? Number.parseInt(key, 10) : key;
    }

    /**
     * Generic helper to build a checkbox entry from filter configuration items.
     */
    private static buildCheckbox<T extends { displayName: string; description: string; key: string | number }>(
      item: T,
      checked = false
    ): S1DescriptionCheckbox {
      return {
        displayName: item.displayName,
        description: item.description,
        key: item.key,
        checked
      };
    }

    private static buildApprovalCheckbox(item: typeof approvalTypeFilterConfig[number], checked = false): S1DescriptionCheckbox {
      return this.buildCheckbox(item, checked);
    }

    /**
     * Builds a checkbox entry for billing term filters.
     */
    private static buildBillingTermCheckbox(item: typeof billingTermFilterConfig[number], checked = false): S1DescriptionCheckbox {
      return this.buildCheckbox(item, checked);
    }

    /**
     * Builds a checkbox entry for reseller status filters.
     */
    private static buildResellerStatusCheckbox(item: typeof resellerStatusFilterConfig[number], checked = false): S1DescriptionCheckbox {
      return this.buildCheckbox(item, checked);
    }

    public static getApprovalTypeData(): S1DescriptionCheckbox[] {
      return approvalTypeFilterConfig.map(item =>
        this.buildApprovalCheckbox(item)
      );
    }

    /**
     * Returns billing term filter options (Standard, Multi-Year).
     * These are mutually exclusive.
     */
    public static getBillingTermData(): S1DescriptionCheckbox[] {
      return billingTermFilterConfig.map(item =>
        this.buildBillingTermCheckbox(item)
      );
    }

    /**
     * Returns reseller status filter options (On Hold, Discontinued).
     * These can be selected independently.
     */
    public static getResellerStatusData(): S1DescriptionCheckbox[] {
      return resellerStatusFilterConfig.map(item =>
        this.buildResellerStatusCheckbox(item)
      );
    }

    /**
     * Restores selected billing terms from UI checkbox state.
     */
    public static getSelectedBillingTermData(selectedTerms: BillingTermFilterEnum[]): S1DescriptionCheckbox[] {
      const selectedSet = new Set(selectedTerms);
      return billingTermFilterConfig.map(item =>
        this.buildBillingTermCheckbox(item, selectedSet.has(item.key))
      );
    }

    /**
     * Restores selected reseller statuses from UI checkbox state.
     */
    public static getSelectedResellerStatusData(selectedStatuses: ResellerStatusFilterEnum[]): S1DescriptionCheckbox[] {
      const selectedSet = new Set(selectedStatuses);
      return resellerStatusFilterConfig.map(item =>
        this.buildResellerStatusCheckbox(item, selectedSet.has(item.key))
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

    /**
     * Enforces mutual exclusivity for billing terms (Standard/Multi-Year).
     * When one term is selected, deselects the other.
     * Reseller status options are not affected.
     */
    public static enforceExclusiveBillingTermSelection(
      previousData: S1DescriptionCheckbox[],
      nextData: S1DescriptionCheckbox[]
    ): S1DescriptionCheckbox[] {
      const normalizedData = nextData.map(item => ({ ...item }));
      const newlyCheckedTerm = normalizedData.find(item =>
        this.isBillingTerm(item.key) &&
        item.checked &&
        !previousData.find(previous => previous.key === item.key)?.checked
      );

      if (!newlyCheckedTerm) {
        return normalizedData;
      }

      return normalizedData.map(item => {
        if (!this.isBillingTerm(item.key) || item.key === newlyCheckedTerm.key) {
          return item;
        }

        return {
          ...item,
          checked: false,
        };
      });
    }

    /**
     * Extracts selected billing term keys from checkbox data.
     */
    public static getSelectedBillingTerms(data: S1DescriptionCheckbox[]): BillingTermFilterEnum[] {
      return data
        .filter(item => item.checked && this.isBillingTerm(item.key))
        .map(item => item.key as BillingTermFilterEnum);
    }

    /**
     * Extracts selected reseller status keys from checkbox data.
     */
    public static getSelectedResellerStatuses(data: S1DescriptionCheckbox[]): ResellerStatusFilterEnum[] {
      return data
        .filter(item => item.checked && this.isResellerStatus(item.key))
        .map(item => item.key as ResellerStatusFilterEnum);
    }

    /**
     * Extracts selected billing term from OrderRequest.
     * Returns the billing term that is active, if any.
     */
    public static getSelectedBillingTermsFromRequest(
      request: Pick<OrderRequest, 'MultiYearContractFilter' | 'MultiYearContract'>
    ): BillingTermFilterEnum[] {
      const selectedTerms: BillingTermFilterEnum[] = [];

      if (request.MultiYearContractFilter === 1) {
        if (request.MultiYearContract) {
          selectedTerms.push(BillingTermFilterEnum.MultiYear);
        } else {
          selectedTerms.push(BillingTermFilterEnum.Standard);
        }
      }

      return selectedTerms;
    }

    /**
     * Extracts selected reseller statuses from OrderRequest.
     */
    public static getSelectedResellerStatusesFromRequest(
      request: Pick<OrderRequest, 'OnHoldFilter' | 'OnHold' | 'DiscontinuedFilter' | 'Discontinued'>
    ): ResellerStatusFilterEnum[] {
      const selectedStatuses: ResellerStatusFilterEnum[] = [];

      if (request.OnHoldFilter === 1 && request.OnHold) {
        selectedStatuses.push(ResellerStatusFilterEnum.OnHold);
      }

      if (request.DiscontinuedFilter === 1 && request.Discontinued) {
        selectedStatuses.push(ResellerStatusFilterEnum.Discontinued);
      }

      return selectedStatuses;
    }

    /**
     * Builds OrderRequest payload for billing term filter.
     * Billing term (Standard/Multi-Year) is mutually exclusive.
     */
    public static buildBillingTermRequest(
      selectedTerms: BillingTermFilterEnum[]
    ): Pick<OrderRequest, 'MultiYearContractFilter' | 'MultiYearContract'> {
      const hasMultiYear = selectedTerms.includes(BillingTermFilterEnum.MultiYear);
      const hasStandard = selectedTerms.includes(BillingTermFilterEnum.Standard);
      const isTermSelected = hasMultiYear || hasStandard;

      return {
        MultiYearContractFilter: isTermSelected ? 1 : 0,
        MultiYearContract: hasMultiYear,
      };
    }

    /**
     * Builds OrderRequest payload for reseller status filter.
     * On Hold and Discontinued are independent flags.
     */
    public static buildResellerStatusRequest(
      selectedStatuses: ResellerStatusFilterEnum[]
    ): Pick<OrderRequest, 'OnHoldFilter' | 'OnHold' | 'DiscontinuedFilter' | 'Discontinued'> {
      const onHoldSelected = selectedStatuses.includes(ResellerStatusFilterEnum.OnHold);
      const discontinuedSelected = selectedStatuses.includes(ResellerStatusFilterEnum.Discontinued);

      return {
        OnHoldFilter: onHoldSelected ? 1 : 0,
        OnHold: onHoldSelected,
        DiscontinuedFilter: discontinuedSelected ? 1 : 0,
        Discontinued: discontinuedSelected,
      };
    }

    /**
     * @deprecated Use buildBillingTermRequest() and buildResellerStatusRequest() instead.
     * This method is kept for backwards compatibility only.
     */
    public static buildBillingCategoryRequest(
      selectedTypes: BillingTermFilterEnum[]
    ): Pick<OrderRequest, 'MultiYearContractFilter' | 'MultiYearContract' | 'OnHoldFilter' | 'OnHold' | 'DiscontinuedFilter' | 'Discontinued'> {
      const termRequest = this.buildBillingTermRequest(selectedTypes);
      const resellerRequest = this.buildResellerStatusRequest([]);
      return { ...termRequest, ...resellerRequest };
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
            PPCFilterTypeEnum.OrderValue,
            PPCFilterTypeEnum.BillingTerm,
            PPCFilterTypeEnum.ResellerStatus,
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

    private static isBillingTerm(key: string | number): key is BillingTermFilterEnum {
      return this.billingTermKeys.has(key as BillingTermFilterEnum);
    }

    private static isResellerStatus(key: string | number): key is ResellerStatusFilterEnum {
      return this.resellerStatusKeys.has(key as ResellerStatusFilterEnum);
    }
}