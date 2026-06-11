import { S1DetailsCardHelper } from './s1-details-card.helper';
import { C3DetailsCardActionEnum } from 'src/app/models/s1/s1-details-card.interface';
import { OrderLine } from 'src/app/models/ppc/order-line.interface';

describe('S1DetailsCardHelper', () => {

  describe('initTablecolumns', () => {
    let columns: any[];

    beforeEach(() => {
      columns = S1DetailsCardHelper.initTablecolumns();
    });

    /**
     * Test: Verify that initTablecolumns returns an array of columns
     */
    it('should return an array of columns', () => {
      expect(Array.isArray(columns)).toBeTrue();
      expect(columns.length).toBeGreaterThan(0);
    });

    /**
     * Test: Verify that all columns have required base properties
     */
    it('should have base properties set for all columns', () => {
      columns.forEach(col => {
        expect(col.cellAlignment).toBe('start');
        expect(col.headerAlignment).toBe('start');
        expect(col.columnType).toBe('html');
        expect(col.isSortable).toBeFalse();
        expect(col.enableEllipsisTooltip).toBeTrue();
      });
    });

    /**
     * Test: Verify that each column has a columnID, displayName, and columnKey
     */
    it('should have displayName and columnKey for each column', () => {
      columns.forEach(col => {
        expect(col.columnID).toBeDefined();
        expect(typeof col.columnID).toBe('number');
        expect(col.displayName).toBeDefined();
        expect(typeof col.displayName).toBe('string');
        expect(col.columnKey).toBeDefined();
        expect(typeof col.columnKey).toBe('string');
      });
    });

    /**
     * Test: Verify specific column configurations
     */
    it('should have Vendor column as first column', () => {
      const vendorCol = columns[0];
      expect(vendorCol.displayName).toBe('Vendor');
      expect(vendorCol.columnKey).toBe('Vendor');
      expect(vendorCol.columnID).toBe(0);
    });

    /**
     * Test: Verify Value column has background color set
     */
    it('should have Value column with backgroundColor', () => {
      const valueCol = columns.find(col => col.columnKey === 'Value');
      expect(valueCol).toBeDefined();
      expect(valueCol.backgroundColor).toBe('#F8F8F8');
    });

    /**
     * Test: Verify Product Name column has key property
     */
    it('should have Product Name column with key property', () => {
      const productCol = columns.find(col => col.columnKey === 'productName');
      expect(productCol).toBeDefined();
      expect(productCol.key).toBe('partNumber');
    });

    /**
     * Test: Verify that formatter functions are defined for all columns
     */
    it('should have formatter function for each column', () => {
      columns.forEach(col => {
        expect(col.formatter).toBeDefined();
        expect(typeof col.formatter).toBe('function');
      });
    });

    /**
     * Test: Verify formatter function returns proper HTML string
     */
    it('should format data correctly with formatter function', () => {
      const mockOrderLine: Partial<OrderLine> = {
        vendorName: 'TestVendor',
        qty: 5 as any,
        fx: 'USD',
        value: 1000
      };

      const vendorCol = columns[0];
      const formattedHtml = vendorCol.formatter(mockOrderLine as OrderLine);

      expect(formattedHtml).toContain('TestVendor');
      expect(formattedHtml).toContain('s1-C-Charcoal');
      expect(formattedHtml).toContain('<span');
    });

    /**
     * Test: Verify formatter handles undefined/null values
     */
    it('should handle undefined values in formatter', () => {
      const mockOrderLine: Partial<OrderLine> = {
        vendorName: undefined
      };

      const vendorCol = columns[0];
      const formattedHtml = vendorCol.formatter(mockOrderLine as OrderLine);

      expect(formattedHtml).toContain('<span');
      expect(formattedHtml).not.toContain('undefined');
    });

    /**
     * Test: Verify correct number of columns
     */
    it('should have 8 columns', () => {
      expect(columns.length).toBe(8);
    });

    /**
     * Test: Verify column order
     */
    it('should have columns in correct order', () => {
      const expectedOrder = [
        'Vendor',
        'Qty',
        'Currency',
        'Value',
        'productName',
        'billingFrequency',
        'billingTerm',
        'orderType'
      ];

      columns.forEach((col, index) => {
        expect(col.columnKey).toBe(expectedOrder[index]);
      });
    });

    /**
     * Test: Verify Billing Frequency column has correct CSS class
     */
    it('should have Billing Frequency column with Stone class', () => {
      const billingFreqCol = columns.find(col => col.columnKey === 'billingFrequency');
      const mockOrderLine: Partial<OrderLine> = { billingFrequency: 'Monthly' };
      const formattedHtml = billingFreqCol.formatter(mockOrderLine as OrderLine);

      expect(formattedHtml).toContain('s1-C-Stone');
      expect(formattedHtml).toContain('Monthly');
    });
  });

  describe('getDeclinedMenu', () => {
    let menu: any;

    beforeEach(() => {
      menu = S1DetailsCardHelper.getDeclinedMenu();
    });

    /**
     * Test: Verify that getDeclinedMenu returns a menu object
     */
    it('should return a menu object', () => {
      expect(menu).toBeDefined();
      expect(typeof menu).toBe('object');
    });

    /**
     * Test: Verify menu has correct properties
     */
    it('should have hasIcon and hasName properties', () => {
      expect(menu.hasIcon).toBeTrue();
      expect(menu.hasName).toBeFalse();
    });

    /**
     * Test: Verify menu has iconURL
     */
    it('should have iconURL property', () => {
      expect(menu.iconURL).toBe('/assets/hamburger_dots_menu_icon_24_24.svg');
    });

    /**
     * Test: Verify menu has subMenu array
     */
    it('should have subMenu array', () => {
      expect(Array.isArray(menu.subMenu)).toBeTrue();
      expect(menu.subMenu.length).toBe(2);
    });

    /**
     * Test: Verify first submenu item (Needs Approval)
     */
    it('should have Needs Approval submenu item', () => {
      const needsApprovalItem = menu.subMenu[0];

      expect(needsApprovalItem.hasIcon).toBeTrue();
      expect(needsApprovalItem.hasName).toBeTrue();
      expect(needsApprovalItem.displayName).toBe('Needs Approval');
      expect(needsApprovalItem.iconURL).toBe('/assets/NeedsApproval.svg');
      expect(needsApprovalItem.onClickEmit).toBe(C3DetailsCardActionEnum.NeedsApproval);
    });

    /**
     * Test: Verify second submenu item (Approve)
     */
    it('should have Approve submenu item', () => {
      const approveItem = menu.subMenu[1];

      expect(approveItem.hasIcon).toBeTrue();
      expect(approveItem.hasName).toBeTrue();
      expect(approveItem.displayName).toBe('Approve');
      expect(approveItem.iconURL).toBe('/assets/Approve.svg');
      expect(approveItem.onClickEmit).toBe(C3DetailsCardActionEnum.Approve);
    });

    /**
     * Test: Verify menu returns consistent data
     */
    it('should return consistent data on multiple calls', () => {
      const menu1 = S1DetailsCardHelper.getDeclinedMenu();
      const menu2 = S1DetailsCardHelper.getDeclinedMenu();

      expect(menu1.hasIcon).toBe(menu2.hasIcon);
      expect(menu1.iconURL).toBe(menu2.iconURL);
      expect(menu1.subMenu.length).toBe(menu2.subMenu.length);
      expect(menu1.subMenu[0].displayName).toBe(menu2.subMenu[0].displayName);
    });

    /**
     * Test: Verify all submenu items have required properties
     */
    it('should have all required properties in submenu items', () => {
      menu.subMenu.forEach((item: any) => {
        expect(item.hasIcon).toBeDefined();
        expect(item.hasName).toBeDefined();
        expect(item.displayName).toBeDefined();
        expect(item.iconURL).toBeDefined();
        expect(item.onClickEmit).toBeDefined();
      });
    });
  });
});
