import { OrderLine } from "src/app/models/ppc/order-line.interface";
import { S1DataTableColumn } from "src/app/models/s1/s1-data-table.interface";
import { C3DetailsCardActionEnum } from "src/app/models/s1/s1-details-card.interface";
import { S1Menu } from "src/app/models/s1/s1-menu.interface";

export class S1DetailsCardHelper {
    public static initTablecolumns(): S1DataTableColumn[] {
        const baseCol = {
            cellAlignment: 'start',
            headerAlignment: 'start',
            columnType: 'html',
            isSortable: false
        };

        // small helper to return a formatter that wraps a property in a span with classes
        const makeFormatter = (prop: keyof OrderLine, classes = '') =>
            (data: OrderLine) => `<span class="${classes}">${data[prop] ?? ''}</span>`;

        const colsConfig: Array<Partial<S1DataTableColumn> & { displayName: string; columnKey: string; columnWidth?: string; key?: string; backgroundColor?: string; formatter: (d: OrderLine) => string; }> = [
            {
                displayName: 'Vendor',
                columnKey: 'Vendor',
                formatter: makeFormatter('vendorName', 's1-C-Charcoal')
            },
            {
                displayName: 'Qty',
                columnKey: 'Qty',
                formatter: makeFormatter('qty', 's1-C-Charcoal')
            },
            {
                displayName: 'Fx',
                columnKey: 'Fx',
                formatter: makeFormatter('fx', 's1-C-Charcoal')
            },
            {
                displayName: 'Value',
                columnKey: 'Value',
                backgroundColor: '#F8F8F8',
                formatter: makeFormatter('value', 's1-C-CG10')
            },
            {
                displayName: 'Product Name',
                columnKey: 'productName',
                key: 'partNumber',
                formatter: makeFormatter('partNumber', 's1-C-CG10')
            },
            {
                displayName: 'Billing Frequency',
                columnKey: 'billingFrequency',
                formatter: makeFormatter('billingFrequency', 's1-C-Stone')
            },
            {
                displayName: 'Billing Term',
                columnKey: 'billingTerm',
                formatter: makeFormatter('billingType', 's1-C-CG10')
            },
            {
                displayName: 'Order Type',
                columnKey: 'orderType',
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