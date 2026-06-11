export interface ApprovalTypeFilter {
    displayName: string;
    key: ApprovalTypeFilterEnum;
    description: string;
}

export enum ApprovalTypeFilterEnum  {
    Manual = 1,
    Auto = 2,
    ERP = 3,
}

export enum BillingTermFilterEnum {
    Standard = 'standard',
    MultiYear = 'multi-year',    
}

export enum ResellerStatusFilterEnum {
    OnHold = 'on-hold',
    Discontinued = 'discontinued',
}

export enum PPCFilterTypeEnum {
    ApprovalType = 'ApprovalType',
    OrderValue = 'OrderValue',
    Country = 'Country',
    BillingTerm = 'BillingTerm',
    ResellerStatus = 'ResellerStatus',
};

export type PPCFilterButtonData = {
    [key in PPCFilterTypeEnum]: {
        displayName: string;
        onClickEvent: string;
    };
}

export type PPCFilterCount = {
    [key in PPCFilterTypeEnum]: number;
}

export interface BillingTermFilter {
    displayName: string;
    key: BillingTermFilterEnum;
    description: string;
}