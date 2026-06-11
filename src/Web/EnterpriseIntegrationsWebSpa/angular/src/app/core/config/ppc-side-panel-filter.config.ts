import { ApprovalTypeFilter, ApprovalTypeFilterEnum, BillingTermFilter, BillingTermFilterEnum, PPCFilterButtonData, ResellerStatusFilterEnum } from "src/app/models/ppc/ppc-filter.interface";

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
    },
    BillingTerm: {
        displayName: 'Billing Term',
        onClickEvent: 'BillingTerm',
    },
    ResellerStatus: {
        displayName: 'Reseller Status',
        onClickEvent: 'ResellerStatus',
    }
};

const approvalType = ApprovalTypeFilterEnum;

export const approvalTypeFilterConfig: ApprovalTypeFilter[] = [
    {
        displayName: 'Manual',
        key: approvalType.Manual,
        description: "Requires manual review and approval before processing."
    },
    {
        displayName: 'Auto',
        key: approvalType.Auto,
        description: "Instantly approved without ERP or manual intervention."
    },
    {
        displayName: 'ERP',
        key: approvalType.ERP,
        description: "Automatically approved via ERP system—no manual action needed."
    },
];

export const billingTermFilterConfig: BillingTermFilter[] = [
    {
        displayName: 'Standard',
        key: BillingTermFilterEnum.Standard,
        description: 'Billing Term ≤ 1 year.'
    },
    {
        displayName: 'Multi-Year',
        key: BillingTermFilterEnum.MultiYear,
        description: 'Billing Term > 1 year.'
    },
];

export const resellerStatusFilterConfig = [
    {
        displayName: 'On Hold',
        key: ResellerStatusFilterEnum.OnHold,
        description: 'Reseller temporarily suspended.'
    },
    {
        displayName: 'Discontinued',
        key: ResellerStatusFilterEnum.Discontinued,
        description: 'Reseller inactive in SAP.'
    },
];
