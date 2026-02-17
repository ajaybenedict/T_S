import { PPCFilterButtonData } from "src/app/models/ppc/ppc-filter.interface";

export const ppcFilterButtonDataConfig: PPCFilterButtonData = {
    ApprovalType: {
        displayName: 'Approval',
        onClickEvent: 'ApprovalType',
    },
    Country: {
        displayName: 'Country',
        onClickEvent: 'Country',
    },
    OrderValue: {
        displayName: 'Order Value',
        onClickEvent: 'OrderValue',
    }
}
