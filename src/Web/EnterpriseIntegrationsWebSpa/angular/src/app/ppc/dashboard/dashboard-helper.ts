import { DatePipe } from "@angular/common";
import { UTC_TIMEZONE } from "src/app/core/constants/constants";
import { OrderResponse } from "src/app/models/ppc/order-api.interface";
import { S1DataTableColumn } from "src/app/models/s1/s1-data-table.interface";
import { S1Menu } from "src/app/models/s1/s1-menu.interface";
import { S1TableColumnManager } from "src/app/models/s1/s1-table-column-manager.interface";
import { C3_COLUMN_CONSTANTS } from "src/app/core/constants/c3-dashboard-column.constants";

interface ApprovalColumnConfig {
  label: string;
  key: string;
  width: string;
  value: (d: OrderResponse) => number | string | null | undefined;
  highlight?: (d: OrderResponse) => boolean;
  isSortable: boolean;
  columnId: number;
}
export class DashboardHelper {
  static readonly C3_VIEW_ONLY_COLUMNS = new Set<string>([
    C3_COLUMN_CONSTANTS.main.resellerDetails.columnKey,
    C3_COLUMN_CONSTANTS.main.country.columnKey,
    C3_COLUMN_CONSTANTS.main.currency.columnKey,
    C3_COLUMN_CONSTANTS.main.endCustomerCost.columnKey,
    C3_COLUMN_CONSTANTS.main.resellerCost.columnKey,
  ]);

  //columnKey should matches the table config
  static readonly defaultColumnManagerConfig: S1TableColumnManager[] = [
    { ...C3_COLUMN_CONSTANTS.main.resellerDetails, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.country, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.currency, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.endCustomerCost, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.resellerCost, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.totalCredit, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.unbilledUsage, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.availableCredit, visible: true },
    { ...C3_COLUMN_CONSTANTS.main.pending, visible: false },
    { ...C3_COLUMN_CONSTANTS.main.pastDue, visible: false },
    { ...C3_COLUMN_CONSTANTS.main.arBalance, visible: false },
  ];

  public static getOrderDateTime(data: string, type: 'date' | 'time', datePipe: DatePipe) {
    const date = new Date(data);
    return type == 'date' ? datePipe.transform(date, 'dd MMM, yyyy') : datePipe.transform(date, 'hh:mm a');
  }
  public static getDefaultColumns(context: any, datePipe: DatePipe): S1DataTableColumn[] {
    return [
      {
        ...C3_COLUMN_CONSTANTS.main.orderDetails,
        formatter: (data: OrderResponse) => this.getOrderDetails(data, datePipe),
        isSortable: true,
        columnType: 'html',
        columnWidth: '4%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 1,
        isClickable: true,
        enableEllipsisTooltip: true,
      },
      {
        ...C3_COLUMN_CONSTANTS.main.resellerDetails,
        formatter: (data: OrderResponse) => this.getResellerDetailsHTML(data),
        isSortable: true,
        columnType: 'html',
        columnWidth: '5%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 8,
        isClickable: true,
        enableEllipsisTooltip: true,
      },
      {
        ...C3_COLUMN_CONSTANTS.main.country,
        formatter: (data: OrderResponse) => `<span class="s1-FW700">${data.country}</span>`,
        isSortable: true,
        columnType: 'html',
        columnWidth: '2%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 2,
        isClickable: true,
        enableEllipsisTooltip: false,
      },
      {
        ...C3_COLUMN_CONSTANTS.main.currency,
        formatter: (data: OrderResponse) => `<span class="s1-FW700">${data.currency}</span>`,
        isSortable: true,
        columnType: 'html',
        columnWidth: '2%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 7,
        isClickable: true,
        enableEllipsisTooltip: false,
      },
      {
        ...C3_COLUMN_CONSTANTS.main.endCustomerCost,
        formatter: (data: OrderResponse) => `<span class="s1-FW700 s1-C-CG10">${data.orderValue}</span>`,
        isSortable: true,
        columnType: 'html',
        columnWidth: '4%',
        backgroundColor: '#F8F8F8',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 3,
        isClickable: true,
        enableEllipsisTooltip: false,
      },
      {
        ...C3_COLUMN_CONSTANTS.main.resellerCost,
        formatter: (data: OrderResponse) => `<span class="s1-FW700 s1-C-CG10">${data.resellerCost}</span>`,
        isSortable: true,
        columnType: 'html',
        columnWidth: '3%',
        backgroundColor: '#F8F8F8',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 4,
        isClickable: true,
        enableEllipsisTooltip: false,
      },
    ];
  }

  private static getOrderDetails(data: OrderResponse, datePipe: DatePipe) {
    const multiYearTag = data.multiYearContract
      ? '<div class="s1-data-table-multi-year-tag">MULTI YEAR</div>'
      : '';

    return  `
        <div class="d-flex gap-2">
          <div class="s1-FW700">${data.orderKey}</div>
          ${multiYearTag}
        </div>
        <div class="s1-C-Stone">${DashboardHelper.getOrderDateTime(data.orderDate, 'date', datePipe)} | ${DashboardHelper.getOrderDateTime(data.orderDate, 'time', datePipe)} | ${UTC_TIMEZONE}</div>`
  }


  private static readonly APPROVAL_COLUMNS: ApprovalColumnConfig[] = [
    { label: C3_COLUMN_CONSTANTS.main.totalCredit.displayName, key: C3_COLUMN_CONSTANTS.main.totalCredit.columnKey, width: '3%', value: d => d.creditLimit, isSortable: true, columnId: 9 },
    { label: C3_COLUMN_CONSTANTS.main.unbilledUsage.displayName, key: C3_COLUMN_CONSTANTS.main.unbilledUsage.columnKey, width: '3.5%', value: d => d.outstanding, isSortable: true, columnId: 5 },
    { label: C3_COLUMN_CONSTANTS.main.availableCredit.displayName, key: C3_COLUMN_CONSTANTS.main.availableCredit.columnKey, width: '3%', value: d => d.available, isSortable: true, columnId: 10 },
    {
      label: C3_COLUMN_CONSTANTS.main.pastDue.displayName,
      key: C3_COLUMN_CONSTANTS.main.pastDue.columnKey,
      width: '3%',
      value: d => d.pastDueAmount,
      highlight: d => d.pastDueAmount > 0,
      isSortable: true,
      columnId: 13,
    },
    { label: C3_COLUMN_CONSTANTS.main.pending.displayName, key: C3_COLUMN_CONSTANTS.main.pending.columnKey, width: '3%', value: d => d.pendingAmount, isSortable: true, columnId: 12 },
    { label: C3_COLUMN_CONSTANTS.main.arBalance.displayName, key: C3_COLUMN_CONSTANTS.main.arBalance.columnKey, width: '3%', value: d => d.arBalance, isSortable: true, columnId: 11 },
  ];

  public static getNeedsApprovalColumns(): S1DataTableColumn[] {
    return this.APPROVAL_COLUMNS.map((c) => ({
      displayName: c.label,
      columnKey: c.key,
      columnWidth: c.width,
      columnID: c.columnId,
      isSortable: c.isSortable,
      columnType: 'html',
      headerAlignment: 'start',
      cellAlignment: 'start',
      isClickable: true,
      formatter: d =>
        `<span class="s1-FW700 s1-C-CG10 ${c.highlight?.(d) ? 's1-C-Cherry' : ''}">
        ${c.value(d) ?? ''}
      </span>`,
      enableEllipsisTooltip: false,
    }));
  }

  // only used in 'Needs Approval' tab
  public static getStatusInfoColumn(): S1DataTableColumn {
    return {
      displayName: C3_COLUMN_CONSTANTS.main.statusInfo.displayName,
      columnID: 0,
      columnKey: C3_COLUMN_CONSTANTS.main.statusInfo.columnKey,
      columnWidth: '1%',
      columnType: 'statusInfo',
      cellAlignment: 'center',
      headerAlignment: 'center',
      isSortable: false,
    };
  }
  public static getActionsColumn(actions: string[]): S1DataTableColumn {
    return {
      displayName: C3_COLUMN_CONSTANTS.main.actions.displayName,
      columnKey: C3_COLUMN_CONSTANTS.main.actions.columnKey,
      isSortable: false,
      columnType: 'btn',
      columnWidth: '2.5%',
      headerAlignment: 'center',
      cellAlignment: 'center',
      columnID: 0,
      actions: actions.map((action) => ({
        emitKey: action,
        imgURL: `/assets/${action}.svg`,
        key: action.toLowerCase(),
        tooltip: action,
        customClass: `btn-action-${action}`,
      })),
    };
  }
  public static getActionerDetailsColumn(title: string, datePipe: DatePipe): S1DataTableColumn {
    return {
      displayName: title,
      columnKey: title,
      isSortable: true,
      columnType: 'html',
      headerAlignment: 'start',
      cellAlignment: 'start',
      formatter: (data: OrderResponse) => this.getActionerDetailsHTML(data, datePipe),
      columnWidth: '13.2%',
      columnID: 6,
      isClickable: true,
      enableEllipsisTooltip: true,
    };
  }
  public static getActionerDetailsHTML(data: OrderResponse, datePipe: DatePipe) {
    let detailsHTML = `
          <div class='actioner-details-container'>
            <div class='approval-type-holder'>
                <span class='approval-type-text'>${this.getApprovalTypeLetter(data.approvalType)}</span>
            </div>
            <div class='action-date'>
                <span>${DashboardHelper.getOrderDateTime(data.updatedOn, 'date', datePipe)}</span>
            </div>
            <div class="action-divider"></div>
            <div class='action-time'>
                <span>${this.getOrderDateTime(data.updatedOn, 'time', datePipe)}</span>
            </div>        
            <div class="action-divider"></div> 
            <span>${UTC_TIMEZONE}</span>       
            <div class="action-divider"></div>        
            <div class='actioner-details'>
                <span>${data.updatedBy}</span>
            </div>
          </div>
        `;
    return detailsHTML;
  }
  public static getResellerDetailsHTML(data: OrderResponse) {
    return `
            <div class='reseller-details-container'>
                <div class='reseller-name'>
                    <span class="s1-FW700 s1-M-R-40px">${data.resellerID}</span>
                </div>
                <div class='reseller-id'>
                    <span class="s1-C-Stone">${data.resellerName}</span>
                </div>
            </div>
        `;
  }
  private static normalizeApprovalType(type?: string): 'AUTO' | 'MANUAL' | 'ERP' {
    const value = (type ?? '').trim().toUpperCase();

    if (value === 'AUTO' || value === 'AUTOAPPROVED' || value === 'AUTOAPPROVEDWITHRULES') {
      return 'AUTO';
    }

    if (value === 'ERP' || value === 'ERPAPPROVAL') {
      return 'ERP';
    }

    // default fallback
    return 'MANUAL';
  }

  public static getApprovalTypeLetter(type: string) {
    switch (this.normalizeApprovalType(type)) {
      case 'AUTO':
        return 'A';
      case 'ERP':
        return 'E';
      default:
        return 'M';
    }
  }
  public static getDropdownActionsColumn(): S1DataTableColumn {
    return {
      displayName: C3_COLUMN_CONSTANTS.main.actions.displayName,
      columnKey: C3_COLUMN_CONSTANTS.main.actions.columnKey,
      isSortable: false,
      columnType: 'dropdown',
      columnWidth: '2%',
      headerAlignment: 'start',
      cellAlignment: 'start',
      dropdown: DashboardHelper.getDeclinedMenu(),
      columnID: 0,
    };
  }
  public static getDeclinedMenu() {
    const data: S1Menu = {
      hasIcon: true,
      hasName: false,
      iconURL: '/assets/hamburger_dots_menu_icon_24_24.svg',
      displayName: 'Menu',
      subMenu: [
        {
          hasIcon: true,
          iconURL: '/assets/NeedsApproval.svg',
          hasName: true,
          displayName: 'Needs Approval',
          onClickEmit: 'Needs Approval',
        },
        {
          hasIcon: true,
          iconURL: '/assets/Approve.svg',
          hasName: true,
          displayName: 'Approve',
          onClickEmit: 'Approve',
        }
      ],
    };
    return data;
  }
}
