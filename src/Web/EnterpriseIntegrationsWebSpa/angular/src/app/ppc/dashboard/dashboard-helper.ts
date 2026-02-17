import { DatePipe } from "@angular/common";
import { OrderResponse } from "src/app/models/ppc/order-api.interface";
import { S1DataTableColumn } from "src/app/models/s1/s1-data-table.interface";
import { S1Menu } from "src/app/models/s1/s1-menu.interface";
import { S1TableColumnManager } from "src/app/models/s1/s1-table-column-manager.interface";

interface ApprovalColumnConfig {
  label: string;
  key: string;
  width: string;
  value: (d: OrderResponse) => number | string | null | undefined;
  highlight?: (d: OrderResponse) => boolean;
}
export class DashboardHelper {
  //columnKey should matches the table config
  static readonly defaultColumnManagerConfig: S1TableColumnManager[] = [
    { displayName: 'Reseller Details', columnKey: 'Reseller Details', visible: true },
    { displayName: 'Country', columnKey: 'Country', visible: true },
    { displayName: 'Fx', columnKey: 'Fx', visible: true },
    { displayName: 'End Customer Cost', columnKey: 'End Customer Cost', visible: true },
    { displayName: 'Reseller Cost', columnKey: 'Reseller Cost', visible: true },
    { displayName: 'Total Credit', columnKey: 'Total Credit', visible: true },
    { displayName: 'Unbilled Usage', columnKey: 'Unbilled Usage', visible: true },
    { displayName: 'Available Credit', columnKey: 'Available Credit', visible: true },
    { displayName: 'Pending', columnKey: 'Pending', visible: false },
    { displayName: 'Past Due', columnKey: 'Pastdue', visible: false },
    { displayName: 'ArBalance', columnKey: 'ArBalance', visible: false },
  ];

  public static getOrderDateTime(data: string, type: 'date' | 'time', datePipe: DatePipe) {
    const date = new Date(data);
    return type == 'date' ? datePipe.transform(date, 'dd MMM, yyyy') : datePipe.transform(date, 'hh:mm a');
  }
  public static getDefaultColumns(context: any, datePipe: DatePipe): S1DataTableColumn[] {
    return [
      {
        displayName: 'Order Details',
        columnKey: 'Order Details',
        formatter: (data: OrderResponse) =>
          `<div class="s1-FW700">${data.orderKey}</div>
               <div class="s1-C-Stone">${DashboardHelper.getOrderDateTime(data.orderDate, 'date', datePipe)} | ${DashboardHelper.getOrderDateTime(data.orderDate, 'time', datePipe)}</div>`,
        isSortable: true,
        columnType: 'html',
        columnWidth: '4%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 1,
        isClickable: true,
      },
      {
        displayName: 'Reseller Details',
        columnKey: 'Reseller Details',
        formatter: (data: OrderResponse) => this.getResellerDetailsHTML(data),
        isSortable: false,
        columnType: 'html',
        columnWidth: '5%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 0,
        isClickable: true,
      },
      {
        displayName: 'Country',
        columnKey: 'Country',
        formatter: (data: OrderResponse) => `<span class="s1-FW700">${data.country}</span>`,
        isSortable: false,
        columnType: 'html',
        columnWidth: '2%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 2,
        isClickable: true,
      },
      {
        displayName: 'Fx',
        columnKey: 'Fx',
        formatter: (data: OrderResponse) => `<span class="s1-FW700">${data.currency}</span>`,
        isSortable: false,
        columnType: 'html',
        columnWidth: '2%',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 0,
        isClickable: true,
      },
      {
        displayName: 'End Customer Cost',
        columnKey: 'End Customer Cost',
        formatter: (data: OrderResponse) => `<span class="s1-FW700 s1-C-CG10">${data.orderValue}</span>`,
        isSortable: false,
        columnType: 'html',
        columnWidth: '4%',
        backgroundColor: '#F8F8F8',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 3,
        isClickable: true,
      },
      {
        displayName: 'Reseller Cost',
        columnKey: 'Reseller Cost',
        formatter: (data: OrderResponse) => `<span class="s1-FW700 s1-C-CG10">${data.resellerCost}</span>`,
        isSortable: false,
        columnType: 'html',
        columnWidth: '3%',
        backgroundColor: '#F8F8F8',
        headerAlignment: 'start',
        cellAlignment: 'start',
        columnID: 4,
        isClickable: true,
      },
    ];
  }


  private static readonly APPROVAL_COLUMNS: ApprovalColumnConfig[] = [
    { label: 'Total Credit', key: 'Total Credit', width: '3%', value: d => d.creditLimit },
    { label: 'Unbilled Usage', key: 'Unbilled Usage', width: '3.5%', value: d => d.outstanding },
    { label: 'Available Credit', key: 'Available Credit', width: '3%', value: d => d.available },
    {
      label: 'Past Due',
      key: 'Pastdue',
      width: '3%',
      value: d => d.pastDueAmount,
      highlight: d => d.pastDueAmount > 0,
    },
    { label: 'Pending', key: 'Pending', width: '3%', value: d => d.pendingAmount },
    { label: 'ArBalance', key: 'ArBalance', width: '3%', value: d => d.arBalance },
  ];

  public static getNeedsApprovalColumns(): S1DataTableColumn[] {
    return this.APPROVAL_COLUMNS.map((c, index) => ({
      displayName: c.label,
      columnKey: c.key,
      columnWidth: c.width,
      columnID: index,
      isSortable: false,
      columnType: 'html',
      headerAlignment: 'start',
      cellAlignment: 'start',
      isClickable: true,
      formatter: d =>
        `<span class="s1-FW700 s1-C-CG10 ${c.highlight?.(d) ? 's1-C-Cherry' : ''}">
        ${c.value(d) ?? ''}
      </span>`,
    }));
  }

  // only used in 'Needs Approval' tab
  public static getStatusInfoColumn(): S1DataTableColumn {
    return {
      displayName: '',
      columnID: 0,
      columnKey: 'statusInfo',
      columnWidth: '1%',
      columnType: 'statusInfo',
      cellAlignment: 'center',
      headerAlignment: 'center',
      isSortable: false,
    };
  }
  public static getActionsColumn(actions: string[]): S1DataTableColumn {
    return {
      displayName: 'Actions',
      columnKey: 'Actions',
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
      isSortable: false,
      columnType: 'html',
      headerAlignment: 'start',
      cellAlignment: 'start',
      formatter: (data: OrderResponse) => this.getActionerDetailsHTML(data, datePipe),
      columnWidth: '13.2%',
      columnID: 0,
      isClickable: true,
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
  public static getApprovalTypeLetter(type: string) {
    if (type == 'Auto') {
      return 'A';
    } else if (type == 'Manual') {
      return 'M';
    } else {
      return 'E';
    }
  }
  public static getDropdownActionsColumn(): S1DataTableColumn {
    return {
      displayName: 'Actions',
      columnKey: 'Actions',
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
