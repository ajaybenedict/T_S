import { OrderLine } from "src/app/models/ppc/order-line.interface";
import { S1DataTableColumn } from "src/app/models/s1/s1-data-table.interface";
import { C3DetailsCardActionEnum } from "src/app/models/s1/s1-details-card.interface";
import { S1Menu } from "src/app/models/s1/s1-menu.interface";
import { C3_COLUMN_CONSTANTS } from "src/app/core/constants/c3-dashboard-column.constants";

export class S1DetailsCardHelper {
    public static initTablecolumns(): S1DataTableColumn[] {
        const baseCol = {
            cellAlignment: 'start',
            headerAlignment: 'start',
            columnType: 'html',
            isSortable: false,
            enableEllipsisTooltip: true
        };

        // small helper to return a formatter that wraps a property in a span with classes
        const makeFormatter = (prop: keyof OrderLine, classes = '') =>
            (data: OrderLine) => `<span class="${classes}">${data[prop] ?? ''}</span>`;

        const colsConfig: Array<Partial<S1DataTableColumn> & { displayName: string; columnKey: string; columnWidth?: string; key?: string; backgroundColor?: string; formatter: (d: OrderLine) => string; }> = [
            {
                ...C3_COLUMN_CONSTANTS.details.vendor,
                formatter: makeFormatter('vendorName', 's1-C-Charcoal')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.qty,
                formatter: makeFormatter('qty', 's1-C-Charcoal')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.currency,
                formatter: makeFormatter('fx', 's1-C-Charcoal')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.value,
                backgroundColor: '#F8F8F8',
                formatter: makeFormatter('value', 's1-C-CG10')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.productName,
                key: 'partNumber',
                formatter: makeFormatter('partNumber', 's1-C-CG10')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.billingFrequency,
                formatter: makeFormatter('billingFrequency', 's1-C-Stone')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.billingTerm,
                formatter: makeFormatter('billingType', 's1-C-CG10')
            },
            {
                ...C3_COLUMN_CONSTANTS.details.orderType,
                formatter: makeFormatter('orderType', 's1-C-Stone')
            },
        ];

        return colsConfig.map((cfg, idx) => ({
            columnID: idx,
            ...baseCol,
            ...cfg
        })) as S1DataTableColumn[];
    }


    public static getDeclinedMenu() {
        const data: S1Menu = {
          hasIcon: true,
          hasName: false,
          iconURL: '/assets/hamburger_dots_menu_icon_24_24.svg',
          subMenu: [
            {
              hasIcon: true,
              iconURL: '/assets/NeedsApproval.svg',
              hasName: true,
              displayName: 'Needs Approval',
              onClickEmit: C3DetailsCardActionEnum.NeedsApproval,
            },
            {
              hasIcon: true,
              iconURL: '/assets/Approve.svg',
              hasName: true,
              displayName: 'Approve',
              onClickEmit: C3DetailsCardActionEnum.Approve,
            }
          ],
        };
        return data;
    }
}