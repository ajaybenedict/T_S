import { BillingTermFilterEnum, ResellerStatusFilterEnum, PPCFilterTypeEnum } from 'src/app/models/ppc/ppc-filter.interface';
import { SidePanelHelper } from './side-panel.helper';

describe('SidePanelHelper - Billing Term & Reseller Status Filters', () => {
  
  describe('getBillingTermData', () => {
    it('should return billing term options (Standard and Multi-Year)', () => {
      const data = SidePanelHelper.getBillingTermData();
      
      expect(data.length).toBe(2);
      expect(data.map(item => item.key)).toContain(BillingTermFilterEnum.Standard);
      expect(data.map(item => item.key)).toContain(BillingTermFilterEnum.MultiYear);
      expect(data.every(item => !item.checked)).toBeTrue();
    });
  });

  describe('getResellerStatusData', () => {
    it('should return reseller status options (On Hold and Discontinued)', () => {
      const data = SidePanelHelper.getResellerStatusData();
      
      expect(data.length).toBe(2);
      expect(data.map(item => item.key)).toContain(ResellerStatusFilterEnum.OnHold);
      expect(data.map(item => item.key)).toContain(ResellerStatusFilterEnum.Discontinued);
      expect(data.every(item => !item.checked)).toBeTrue();
    });
  });

  describe('getSelectedBillingTermData', () => {
    it('should restore selected billing terms with checked state', () => {
      const data = SidePanelHelper.getSelectedBillingTermData([BillingTermFilterEnum.MultiYear]);
      
      const multiYear = data.find(item => item.key === BillingTermFilterEnum.MultiYear);
      const standard = data.find(item => item.key === BillingTermFilterEnum.Standard);
      
      expect(multiYear?.checked).toBeTrue();
      expect(standard?.checked).toBeFalse();
    });
  });

  describe('getSelectedResellerStatusData', () => {
    it('should restore selected reseller statuses with checked state', () => {
      const data = SidePanelHelper.getSelectedResellerStatusData([
        ResellerStatusFilterEnum.OnHold,
        ResellerStatusFilterEnum.Discontinued
      ]);
      
      const onHold = data.find(item => item.key === ResellerStatusFilterEnum.OnHold);
      const discontinued = data.find(item => item.key === ResellerStatusFilterEnum.Discontinued);
      
      expect(onHold?.checked).toBeTrue();
      expect(discontinued?.checked).toBeTrue();
    });

    it('should handle partial selection of reseller statuses', () => {
      const data = SidePanelHelper.getSelectedResellerStatusData([ResellerStatusFilterEnum.OnHold]);
      
      const onHold = data.find(item => item.key === ResellerStatusFilterEnum.OnHold);
      const discontinued = data.find(item => item.key === ResellerStatusFilterEnum.Discontinued);
      
      expect(onHold?.checked).toBeTrue();
      expect(discontinued?.checked).toBeFalse();
    });
  });

  describe('getSelectedBillingTerms', () => {
    it('should extract selected billing terms from checkbox data', () => {
      const checkboxData = [
        { displayName: 'Standard', key: BillingTermFilterEnum.Standard, checked: true, description: '' },
        { displayName: 'Multi-Year', key: BillingTermFilterEnum.MultiYear, checked: false, description: '' }
      ];
      
      const selected = SidePanelHelper.getSelectedBillingTerms(checkboxData);
      
      expect(selected).toEqual([BillingTermFilterEnum.Standard]);
    });
  });

  describe('getSelectedResellerStatuses', () => {
    it('should extract selected reseller statuses from checkbox data', () => {
      const checkboxData = [
        { displayName: 'On Hold', key: ResellerStatusFilterEnum.OnHold, checked: true, description: '' },
        { displayName: 'Discontinued', key: ResellerStatusFilterEnum.Discontinued, checked: true, description: '' }
      ];
      
      const selected = SidePanelHelper.getSelectedResellerStatuses(checkboxData);
      
      expect(selected).toContain(ResellerStatusFilterEnum.OnHold);
      expect(selected).toContain(ResellerStatusFilterEnum.Discontinued);
    });
  });

  describe('buildBillingTermRequest', () => {
    it('should build request payload for Multi-Year billing term', () => {
      const payload = SidePanelHelper.buildBillingTermRequest([BillingTermFilterEnum.MultiYear]);
      
      expect(payload).toEqual({
        MultiYearContractFilter: 1,
        MultiYearContract: true,
      });
    });

    it('should build request payload for Standard billing term', () => {
      const payload = SidePanelHelper.buildBillingTermRequest([BillingTermFilterEnum.Standard]);
      
      expect(payload).toEqual({
        MultiYearContractFilter: 1,
        MultiYearContract: false,
      });
    });

    it('should disable billing term filter when no term is selected', () => {
      const payload = SidePanelHelper.buildBillingTermRequest([]);
      
      expect(payload).toEqual({
        MultiYearContractFilter: 0,
        MultiYearContract: false,
      });
    });

    it('should prioritize Multi-Year when both terms are selected', () => {
      // This test validates that when both terms are selected, Multi-Year takes precedence
      const payload = SidePanelHelper.buildBillingTermRequest([
        BillingTermFilterEnum.Standard,
        BillingTermFilterEnum.MultiYear
      ]);
      
      expect(payload).toEqual({
        MultiYearContractFilter: 1,
        MultiYearContract: true, // Multi-Year is prioritized
      });
    });
  });

  describe('buildResellerStatusRequest', () => {
    it('should build request payload for On Hold status', () => {
      const payload = SidePanelHelper.buildResellerStatusRequest([ResellerStatusFilterEnum.OnHold]);
      
      expect(payload).toEqual({
        OnHoldFilter: 1,
        OnHold: true,
        DiscontinuedFilter: 0,
        Discontinued: false,
      });
    });

    it('should build request payload for Discontinued status', () => {
      const payload = SidePanelHelper.buildResellerStatusRequest([ResellerStatusFilterEnum.Discontinued]);
      
      expect(payload).toEqual({
        OnHoldFilter: 0,
        OnHold: false,
        DiscontinuedFilter: 1,
        Discontinued: true,
      });
    });

    it('should allow independent selection of both On Hold and Discontinued', () => {
      const payload = SidePanelHelper.buildResellerStatusRequest([
        ResellerStatusFilterEnum.OnHold,
        ResellerStatusFilterEnum.Discontinued
      ]);
      
      expect(payload.OnHoldFilter).toBe(1);
      expect(payload.OnHold).toBeTrue();
      expect(payload.DiscontinuedFilter).toBe(1);
      expect(payload.Discontinued).toBeTrue();
    });

    it('should disable reseller status filters when no status is selected', () => {
      const payload = SidePanelHelper.buildResellerStatusRequest([]);
      
      expect(payload).toEqual({
        OnHoldFilter: 0,
        OnHold: false,
        DiscontinuedFilter: 0,
        Discontinued: false,
      });
    });
  });

  describe('getSelectedBillingTermsFromRequest', () => {
    it('should extract Multi-Year billing term from request', () => {
      const selected = SidePanelHelper.getSelectedBillingTermsFromRequest({
        MultiYearContractFilter: 1,
        MultiYearContract: true,
      });
      
      expect(selected).toEqual([BillingTermFilterEnum.MultiYear]);
    });

    it('should extract Standard billing term from request', () => {
      const selected = SidePanelHelper.getSelectedBillingTermsFromRequest({
        MultiYearContractFilter: 1,
        MultiYearContract: false,
      });
      
      expect(selected).toEqual([BillingTermFilterEnum.Standard]);
    });

    it('should return empty array when MultiYearContractFilter is disabled', () => {
      const selected = SidePanelHelper.getSelectedBillingTermsFromRequest({
        MultiYearContractFilter: 0,
        MultiYearContract: true,
      });
      
      expect(selected).toEqual([]);
    });
  });

  describe('getSelectedResellerStatusesFromRequest', () => {
    it('should extract On Hold status from request', () => {
      const selected = SidePanelHelper.getSelectedResellerStatusesFromRequest({
        OnHoldFilter: 1,
        OnHold: true,
        DiscontinuedFilter: 0,
        Discontinued: false,
      });
      
      expect(selected).toEqual([ResellerStatusFilterEnum.OnHold]);
    });

    it('should extract Discontinued status from request', () => {
      const selected = SidePanelHelper.getSelectedResellerStatusesFromRequest({
        OnHoldFilter: 0,
        OnHold: false,
        DiscontinuedFilter: 1,
        Discontinued: true,
      });
      
      expect(selected).toEqual([ResellerStatusFilterEnum.Discontinued]);
    });

    it('should extract both On Hold and Discontinued when both are active', () => {
      const selected = SidePanelHelper.getSelectedResellerStatusesFromRequest({
        OnHoldFilter: 1,
        OnHold: true,
        DiscontinuedFilter: 1,
        Discontinued: true,
      });
      
      expect(selected).toContain(ResellerStatusFilterEnum.OnHold);
      expect(selected).toContain(ResellerStatusFilterEnum.Discontinued);
    });

    it('should return empty array when no reseller status is active', () => {
      const selected = SidePanelHelper.getSelectedResellerStatusesFromRequest({
        OnHoldFilter: 0,
        OnHold: false,
        DiscontinuedFilter: 0,
        Discontinued: false,
      });
      
      expect(selected).toEqual([]);
    });

    it('should ignore OnHold flag if OnHoldFilter is disabled', () => {
      const selected = SidePanelHelper.getSelectedResellerStatusesFromRequest({
        OnHoldFilter: 0,
        OnHold: true, // Flag is true but filter is disabled, should be ignored
        DiscontinuedFilter: 0,
        Discontinued: false,
      });
      
      expect(selected).toEqual([]);
    });
  });

  describe('enforceExclusiveBillingTermSelection', () => {
    it('should keep billing terms mutually exclusive when Multi-Year is selected', () => {
      const previousData = SidePanelHelper.getSelectedBillingTermData([BillingTermFilterEnum.Standard]);
      const nextData = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.Standard,
        BillingTermFilterEnum.MultiYear
      ]);
      
      const normalized = SidePanelHelper.enforceExclusiveBillingTermSelection(previousData, nextData);
      
      const standard = normalized.find(item => item.key === BillingTermFilterEnum.Standard);
      const multiYear = normalized.find(item => item.key === BillingTermFilterEnum.MultiYear);
      
      expect(standard?.checked).toBeFalse();
      expect(multiYear?.checked).toBeTrue();
    });

    it('should keep billing terms mutually exclusive when Standard is selected', () => {
      const previousData = SidePanelHelper.getSelectedBillingTermData([BillingTermFilterEnum.MultiYear]);
      const nextData = SidePanelHelper.getSelectedBillingTermData([
        BillingTermFilterEnum.Standard,
        BillingTermFilterEnum.MultiYear
      ]);
      
      const normalized = SidePanelHelper.enforceExclusiveBillingTermSelection(previousData, nextData);
      
      const standard = normalized.find(item => item.key === BillingTermFilterEnum.Standard);
      const multiYear = normalized.find(item => item.key === BillingTermFilterEnum.MultiYear);
      
      expect(standard?.checked).toBeTrue();
      expect(multiYear?.checked).toBeFalse();
    });

    it('should handle deselection without affecting other options', () => {
      const previousData = SidePanelHelper.getSelectedBillingTermData([BillingTermFilterEnum.Standard]);
      const nextData = SidePanelHelper.getSelectedBillingTermData([]);
      
      const normalized = SidePanelHelper.enforceExclusiveBillingTermSelection(previousData, nextData);
      
      expect(normalized.every(item => !item.checked)).toBeTrue();
    });
  });

  describe('updateButtons', () => {
    it('should include both BillingTerm and ResellerStatus in button update', () => {
      const buttons = SidePanelHelper.getButtons();
      const updatedButtons = SidePanelHelper.updateButtons(buttons, {
        ApprovalType: 0,
        Country: 0,
        OrderValue: 0,
        BillingTerm: 1,
        ResellerStatus: 2,
      });

      expect(updatedButtons[PPCFilterTypeEnum.BillingTerm].selectedCount).toBe(1);
      expect(updatedButtons[PPCFilterTypeEnum.BillingTerm].hasCloseBtn).toBeTrue();
      expect(updatedButtons[PPCFilterTypeEnum.ResellerStatus].selectedCount).toBe(2);
      expect(updatedButtons[PPCFilterTypeEnum.ResellerStatus].hasCloseBtn).toBeTrue();
    });

    it('should clear button state when counts are zero', () => {
      const buttons = SidePanelHelper.getButtons();
      buttons[PPCFilterTypeEnum.BillingTerm].selectedCount = 1;
      buttons[PPCFilterTypeEnum.BillingTerm].hasCloseBtn = true;

      const updatedButtons = SidePanelHelper.updateButtons(buttons, {
        ApprovalType: 0,
        Country: 0,
        OrderValue: 0,
        BillingTerm: 0,
        ResellerStatus: 0,
      });

      expect(updatedButtons[PPCFilterTypeEnum.BillingTerm].selectedCount).toBeUndefined();
      expect(updatedButtons[PPCFilterTypeEnum.BillingTerm].hasCloseBtn).toBeUndefined();
    });
  });

  describe('backwards compatibility', () => {
    it('should maintain buildBillingCategoryRequest for legacy code', () => {
      const payload = SidePanelHelper.buildBillingCategoryRequest([BillingTermFilterEnum.Standard]);
      
      // Should still return the combined payload structure
      expect(payload.MultiYearContractFilter).toBe(1);
      expect(payload.MultiYearContract).toBeFalse();
      expect(payload.OnHoldFilter).toBe(0);
      expect(payload.DiscontinuedFilter).toBe(0);
    });
  });
});